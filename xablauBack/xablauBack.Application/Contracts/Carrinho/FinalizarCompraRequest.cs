namespace xablauBack.Application.Contracts.Carrinho;

public class FinalizarCompraRequest
{
    public string MetodoPagamento { get; set; } = string.Empty;
    public string Cep { get; set; } = string.Empty;
    public string FreteLabel { get; set; } = string.Empty;
    public decimal FreteValor { get; set; }
    public string? CupomCodigo { get; set; }
    public decimal Desconto { get; set; }
    public int Parcelas { get; set; }
    public decimal Juros { get; set; }
    public decimal Total { get; set; }
}
