import { describe, expect, it, vi } from 'vitest';
import { EMAIL_MASK, PHONE_MASK, createLogger, maskPersonalData, redact } from './logger';

describe('maskPersonalData', () => {
  it('masque les adresses email', () => {
    expect(maskPersonalData('Contact : awa.kone@example.com.')).toBe(`Contact : ${EMAIL_MASK}.`);
  });
  it.each(['+225 01 02 03 04 05', '0102030405', '+225.01.02.03.04.05', '(+225) 0102030405'])(
    'masque le téléphone %s',
    (phone) => {
      expect(maskPersonalData(`Appeler ${phone}`)).toBe(`Appeler ${PHONE_MASK}`);
    },
  );
  it('conserve les dates, montants courts et textes ordinaires', () => {
    expect(maskPersonalData('Le 14/10/2026, 15 000 FCFA, étape 3')).toBe(
      'Le 14/10/2026, 15 000 FCFA, étape 3',
    );
  });
});

describe('redact', () => {
  it('masque récursivement objets, tableaux et clés sensibles', () => {
    expect(
      redact({
        email: 'awa@example.com',
        note: 'joindre au 0102030405',
        liste: ['x@example.org'],
        erreur: new Error('échec pour awa@example.com'),
        n: 3,
      }),
    ).toEqual({
      email: '[masqué]',
      note: `joindre au ${PHONE_MASK}`,
      liste: [EMAIL_MASK],
      erreur: { name: 'Error', message: `échec pour ${EMAIL_MASK}` },
      n: 3,
    });
  });
});

describe('createLogger', () => {
  it("n'écrit jamais de donnée personnelle", () => {
    const sink = vi.fn();
    const logger = createLogger(sink);
    logger.info('Message de awa@example.com', { tel: '+225 01 02 03 04 05' });
    logger.error('Appel 0102030405');
    expect(sink).toHaveBeenNthCalledWith(1, 'info', `Message de ${EMAIL_MASK}`, {
      tel: '[masqué]',
    });
    expect(sink).toHaveBeenNthCalledWith(2, 'error', `Appel ${PHONE_MASK}`, undefined);
    expect(JSON.stringify(sink.mock.calls)).not.toMatch(/example\.com|0102030405/);
  });
});
