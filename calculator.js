// @ts-check
/**
 * Compares monthly gross sales revenue at two conversion rates.
 * Inputs are user assumptions, never a forecast or verified loss.
 * @param {number} contacts Unique monthly prospects.
 * @param {number} current Current conversion percentage (0..100).
 * @param {number} scenario Hypothetical conversion percentage (0..100).
 * @param {number} ticket Average realized vehicle sale price in BRL.
 */
function calculateBergerRevenue(contacts, current, scenario, ticket) {
  if (![contacts, current, scenario, ticket].every(Number.isFinite)) throw new RangeError('Preencha todos os campos com números válidos.');
  if (!Number.isInteger(contacts) || contacts < 0 || contacts > 100000) throw new RangeError('Informe de 0 a 100.000 interessados, sem casas decimais.');
  if (current < 0 || current > 100 || scenario < 0 || scenario > 100) throw new RangeError('As conversões precisam estar entre 0% e 100%.');
  if (ticket < 0 || ticket > 10000000) throw new RangeError('Informe um valor médio entre R$ 0 e R$ 10.000.000.');
  const currentSales = contacts * current / 100;
  const scenarioSales = contacts * scenario / 100;
  const additionalSales = contacts * (scenario - current) / 100;
  return {currentSales, scenarioSales, additionalSales, currentRevenue: currentSales * ticket, scenarioRevenue: scenarioSales * ticket, additionalRevenue: additionalSales * ticket};
}
