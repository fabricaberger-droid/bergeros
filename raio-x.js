// @ts-check
/**
 * Raio-X do Pátio — custo de carregar o estoque parado.
 * As entradas são premissas de quem responde. Não é previsão, não é perda comprovada.
 * A conta roda no navegador; nada é enviado sem a pessoa abrir o WhatsApp e ler a mensagem.
 */
(() => {
  'use strict';

  const WHATS = '5547999122932';
  const EXEMPLO = {total: 40, parados: 9, valor: 45000, taxa: '0.015'};

  const el = (/** @type {string} */ id) => document.getElementById(id);
  const brl = (/** @type {number} */ v) =>
    v.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL', maximumFractionDigits: 0});

  const campos = {
    total:   /** @type {HTMLInputElement|null}  */ (el('rx-total')),
    parados: /** @type {HTMLInputElement|null}  */ (el('rx-parados')),
    valor:   /** @type {HTMLInputElement|null}  */ (el('rx-valor')),
    taxa:    /** @type {HTMLSelectElement|null} */ (el('rx-taxa')),
  };
  const saida = {
    capital: el('rx-capital'), capitalSub: el('rx-capital-sub'),
    mes: el('rx-mes'), mesSub: el('rx-mes-sub'),
    noventa: el('rx-90'), noventaSub: el('rx-90-sub'),
    aviso: el('rx-aviso'), erro: el('rx-erro'),
    whats: /** @type {HTMLAnchorElement|null} */ (el('rx-whats')),
  };

  if (!campos.total || !campos.parados || !campos.valor || !campos.taxa) return;

  /**
   * @param {number} parados
   * @param {number} valor
   * @param {number} taxa
   */
  function conta(parados, valor, taxa) {
    const capital = parados * valor;
    const porMes = capital * taxa;
    return {capital, porMes, noventaDias: porMes * 3, porCarroMes: valor * taxa};
  }

  function ler() {
    const total   = Number(campos.total?.value);
    const parados = Number(campos.parados?.value);
    const valor   = Number(campos.valor?.value);
    const taxa    = Number(campos.taxa?.value);
    if (![total, parados, valor, taxa].every(Number.isFinite)) return {erro: 'Preencha os quatro campos.'};
    if (!Number.isInteger(total) || total < 1 || total > 2000) return {erro: 'Informe de 1 a 2.000 carros no pátio, sem casas decimais.'};
    if (!Number.isInteger(parados) || parados < 0 || parados > 2000) return {erro: 'Informe quantos carros estão parados, sem casas decimais.'};
    if (parados > total) return {erro: 'Os carros parados não podem passar do total do pátio.'};
    if (valor < 0 || valor > 2000000) return {erro: 'Informe um valor médio de compra entre R$ 0 e R$ 2.000.000.'};
    return {total, parados, valor, taxa};
  }

  function render() {
    const d = ler();
    if (!saida.erro) return;
    if ('erro' in d && d.erro) { saida.erro.textContent = d.erro; return; }
    saida.erro.textContent = '';

    const total = /** @type {number} */ (d.total);
    const parados = /** @type {number} */ (d.parados);
    const valor = /** @type {number} */ (d.valor);
    const taxa = /** @type {number} */ (d.taxa);
    const r = conta(parados, valor, taxa);
    const pct = (taxa * 100).toLocaleString('pt-BR', {maximumFractionDigits: 1});

    if (saida.capital) saida.capital.textContent = brl(r.capital);
    if (saida.capitalSub) saida.capitalSub.textContent = parados === 0
      ? 'Você marcou nenhum carro parado há mais de 90 dias.'
      : `${parados} ${parados === 1 ? 'carro' : 'carros'} de ${total} no pátio, a ${brl(valor)} de média.`;

    if (saida.mes) saida.mes.textContent = brl(r.porMes);
    if (saida.mesSub) saida.mesSub.textContent = parados === 0
      ? 'Sem carro parado, não há custo de carregamento nesta conta.'
      : `Dá cerca de ${brl(r.porCarroMes)} por mês em cada um desses carros.`;

    if (saida.noventa) saida.noventa.textContent = brl(r.noventaDias);
    if (saida.noventaSub) saida.noventaSub.textContent = 'Três meses ao mesmo custo por mês.';

    if (saida.aviso) {
      saida.aviso.innerHTML = taxa === 0.015
        ? 'A conta usou a taxa que você marcou. Como você deixou <strong>1,5%</strong>, esse número é <strong>referência de mercado, não a conta da sua loja</strong> — na conversa a gente usa o seu.'
        : `A conta usou a taxa que você marcou: <strong>${pct}% ao mês</strong>. É o seu número, não média de mercado.`;
    }

    if (saida.whats) {
      const msg = [
        'Olá, Raphael. Fiz o Raio-X do Pátio no seu site.',
        '',
        `Carros no pátio: ${total}`,
        `Parados há mais de 90 dias: ${parados}`,
        `Valor médio de compra: ${brl(valor)}`,
        `Custo que marquei: ${pct}% ao mês`,
        '',
        `Dinheiro parado: ${brl(r.capital)}`,
        `Custo por mês: ${brl(r.porMes)}`,
        `Nos 90 dias: ${brl(r.noventaDias)}`,
        '',
        'Quero entender o que dá pra fazer com isso.',
      ].join('\n');
      saida.whats.href = `https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`;
    }
  }

  Object.values(campos).forEach(c => {
    c?.addEventListener('input', render);
    c?.addEventListener('change', render);
  });

  el('rx-reset')?.addEventListener('click', () => {
    if (campos.total) campos.total.value = String(EXEMPLO.total);
    if (campos.parados) campos.parados.value = String(EXEMPLO.parados);
    if (campos.valor) campos.valor.value = String(EXEMPLO.valor);
    if (campos.taxa) campos.taxa.value = EXEMPLO.taxa;
    render();
    campos.total?.focus();
  });

  render();
})();
