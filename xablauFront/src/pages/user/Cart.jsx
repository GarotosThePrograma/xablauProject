import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartProductCard } from "../../components/common/CartProductCard";
import { PageLoadingBar } from '../../components/common/PageLoadingBar';
import { Flex, Text, Button, Box } from "@chakra-ui/react";
import { useCartStore } from "../../store/useCartStore";
import { isCouponExpired, normalizeCouponCode, useCouponsStore } from '../../store/useCouponsStore';
import { useToastStore } from '../../store/useToastStore';

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function calculateShipping(cep) {
  const digits = cep.replace(/\D/g, '');

  if (digits.length !== 8) {
    return null;
  }

  const prefix = Number(digits.slice(0, 2));
  const fullCep = Number(digits);

  if (fullCep >= 90000000 && fullCep <= 91999999) {
    return { label: 'Porto Alegre e região', value: 12.90 };
  }

  if (prefix >= 90 && prefix <= 99) {
    return { label: 'Rio Grande do Sul', value: 19.90 };
  }

  if (prefix >= 80 && prefix <= 89) {
    return { label: 'Região Sul', value: 24.90 };
  }

  return { label: 'Demais regiões', value: 39.90 };
}

function calculateInstallmentTotal(total, installments) {
  if (installments <= 3) {
    return total;
  }

  const interestRate = (installments - 3) * 0.025;
  return total * (1 + interestRate);
}

function CartItemSkeleton() {
  return (
    <Flex
      w={{ base: '100%', md: '900px' }}
      maxW="100%"
      p={{ base: '14px', md: '20px' }}
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="14px"
      m={{ base: '0 0 14px', md: '15px' }}
      gap="18px"
      align="center"
      direction={{ base: 'column', sm: 'row' }}
      animation="pulse 1.4s ease-in-out infinite"
    >
      <Box boxSize={{ base: '120px', md: '150px' }} bg="gray.200" borderRadius="8px" />
      <Flex direction="column" flex="1" gap="10px">
        <Box h="18px" bg="gray.200" borderRadius="6px" w="78%" />
        <Box h="14px" bg="gray.200" borderRadius="6px" w="48%" />
        <Box h="14px" bg="gray.200" borderRadius="6px" w="56%" />
      </Flex>
      <Box h="36px" w={{ base: '100%', sm: '90px' }} bg="gray.200" borderRadius="8px" />
      <Box h="46px" w={{ base: '100%', sm: '110px' }} bg="gray.200" borderRadius="8px" />
    </Flex>
  );
}

function OrderSummarySkeleton() {
  return (
    <Flex
      direction="column"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="14px"
      p="24px"
      w="100%"
      gap="14px"
      marginTop="124px"
      animation="pulse 1.4s ease-in-out infinite"
    >
      <Box h="22px" bg="gray.200" borderRadius="6px" w="70%" />
      <Box h="16px" bg="gray.200" borderRadius="6px" />
      <Box h="16px" bg="gray.200" borderRadius="6px" />
      <Box h="1px" bg="gray.200" />
      <Box h="24px" bg="gray.200" borderRadius="6px" />
      <Box h="40px" bg="gray.200" borderRadius="8px" />
    </Flex>
  );
}

export function Cart() {
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const loadCart = useCartStore((state) => state.loadCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const finishPurchase = useCartStore((state) => state.finishPurchase);
  const coupons = useCouponsStore((state) => state.coupons);
  const showToast = useToastStore((state) => state.showToast);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [installments, setInstallments] = useState(1);
  const [cep, setCep] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const totalAmount = cart.reduce((acc, product) => {
    return acc + (product.price * product.quantity);
  }, 0);

  const shipping = calculateShipping(cep);
  const shippingAmount = shipping?.value ?? 0;
  const discountAmount = appliedCoupon ? totalAmount * (appliedCoupon.discountPercent / 100) : 0;
  const finalTotal = Math.max(totalAmount - discountAmount, 0) + shippingAmount;
  const paymentTotal = paymentMethod === 'credit-card'
    ? calculateInstallmentTotal(finalTotal, installments)
    : finalTotal;
  const interestAmount = paymentTotal - finalTotal;
  const cepDigits = cep.replace(/\D/g, '');
  const formattedTotal = formatCurrency(totalAmount);
  const formattedFinalTotal = formatCurrency(paymentTotal);

  const handleCouponChange = (value) => {
    setCouponCode(normalizeCouponCode(value));
    setAppliedCoupon(null);
    setCouponMessage('');
  };

  const handleApplyCoupon = () => {
    const coupon = coupons.find((item) => item.code === couponCode);

    if (!coupon) {
      setAppliedCoupon(null);
      setCouponMessage('Cupom não encontrado.');
      return;
    }

    if (isCouponExpired(coupon)) {
      setAppliedCoupon(null);
      setCouponMessage('Esse cupom expirou.');
      return;
    }

    setAppliedCoupon(coupon);
    setCouponMessage(`${coupon.code} aplicado: ${coupon.discountPercent}% de desconto.`);
  };

  const handleFinishPurchase = async () => {
    if (!shipping) {
      setCheckoutMessage('Digite um CEP válido com 8 números para calcular o frete.');
      return;
    }

    setIsFinishing(true);
    setCheckoutMessage('');

    try {
      await finishPurchase({
        paymentMethod,
        cep: cepDigits,
        shipping,
        couponCode: appliedCoupon?.code ?? null,
        discount: discountAmount,
        installments: paymentMethod === 'credit-card' ? installments : 1,
        interest: interestAmount,
        total: paymentTotal,
      });
      showToast({
        title: 'Compra finalizada',
        message: 'Seu pedido foi enviado para a área de pedidos.',
        duration: 3800,
      });
      navigate('/orders');
    } catch (error) {
      await loadCart();
      setCheckoutMessage(error.message || 'Não foi possível finalizar a compra agora.');
    } finally {
      setIsFinishing(false);
    }
  };

  if (isLoading) {
    return (
      <Flex w="100%" direction={{ base: 'column', lg: 'row' }} gap={{ base: '18px', lg: '0' }} p={{ base: '16px', md: '0' }}>
        <PageLoadingBar />
        <Flex direction="column" alignItems="center" flex={{ base: '1', lg: '0 0 75%' }} maxW="100%" minW="0">
          <Flex
            justify="center"
            alignItems="center"
            w="100%"
            m={{ base: '0 0 10px', md: '20px' }}
            fontSize={{ base: '24px', md: '30px' }}
            fontWeight="bold"
          >
            Carrinho
          </Flex>

          <Flex direction="column" w="100%" align="center">
            {Array.from({ length: 3 }).map((_, index) => (
              <CartItemSkeleton key={index} />
            ))}
          </Flex>
        </Flex>

        <Flex direction="column" alignItems="center" flex={{ base: '1', lg: '0 0 25%' }} maxW="100%" p={{ base: '0', lg: '20px' }}>
          <OrderSummarySkeleton />
        </Flex>
      </Flex>
    );
  }

  if (cart.length === 0) {
    return (
      <Flex direction="column" align="center" p={{ base: '28px 16px', md: '40px 24px' }} gap="24px">
        <Text fontSize={{ base: '26px', md: '30px' }} fontWeight="bold" color="gray.900">
          Carrinho
        </Text>

        <Flex
          direction="column"
          align="center"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="8px"
          maxW="720px"
          w="100%"
          p={{ base: '20px', md: '28px' }}
          gap="14px"
          textAlign="center"
        >
          <Box>
            <Text fontSize="20px" fontWeight="700" color="gray.900">
              Seu carrinho está vazio
            </Text>
            <Text color="gray.600" mt="6px">
              Você ainda não tem itens no carrinho.
            </Text>
          </Box>

          <Button
            as={Link}
            to="/"
            bg="linear-gradient(to top, #004d8e, #3695e3)"
            color="white"
            borderRadius="8px"
            p="5px"
            _hover={{ bg: 'linear-gradient(to top, #00325a, #1f66a0)' }}
          >
            Continuar comprando
          </Button>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex w='100%' direction={{ base: 'column', lg: 'row' }} gap={{ base: '18px', lg: '0' }} p={{ base: '16px', md: '0' }}>
      <Flex direction='column' alignItems='center' flex={{ base: '1', lg: '0 0 75%' }} maxW="100%" minW="0">
        <Flex
          justify='center'
          alignItems='center'
          w='100%'
          m={{ base: '0 0 10px', md: '20px' }}
          fontSize={{ base: '24px', md: '30px' }}
          fontWeight='bold'
        >
          Carrinho
        </Flex>

        <Flex direction='column' w="100%" align="center">
          {cart.map((product) => (
            <CartProductCard
              key={product.id}
              product={product}
            />
          ))}
        </Flex>
      </Flex>

      <Flex direction='column' alignItems='center' flex={{ base: '1', lg: '0 0 25%' }} maxW="100%" p={{ base: '0', lg: '20px' }}>
        <Flex
          direction='column'
          bg='white'
          border='1px solid'
          borderColor='gray.200'
          borderRadius='14px'
          p={{ base: '18px', md: '24px' }}
          w='100%'
          minW='0'
          gap='12px'
          marginTop={{ base: '0', lg: '124px' }}
        >
          <Text fontSize='18px' fontWeight='bold' color='gray.900' mb='8px'>
            Resumo do Pedido
          </Text>

          <Flex justify='space-between' gap="12px" minW="0">
            <Text color='gray.500'>Subtotal</Text>
            <Text fontWeight='bold'>{formattedTotal}</Text>
          </Flex>

          {appliedCoupon && (
            <Flex justify='space-between' align="flex-start" gap="10px">
              <Text
                color='gray.500'
                minW="0"
                overflowWrap="anywhere"
                wordBreak="break-word"
                whiteSpace="normal"
              >
                Cupom {appliedCoupon.code}
              </Text>
              <Text fontWeight='bold' color='green.600' flexShrink="0">- {formatCurrency(discountAmount)}</Text>
            </Flex>
          )}

          <Flex justify='space-between' gap="12px" minW="0">
            <Text color='gray.500'>Frete</Text>
            <Text fontWeight='bold' color={shipping ? 'gray.900' : 'gray.500'}>
              {shipping ? formatCurrency(shippingAmount) : 'A calcular'}
            </Text>
          </Flex>

          {shipping && (
            <Text fontSize="12px" color="gray.500">
              {shipping.label}
            </Text>
          )}

          {interestAmount > 0 && (
            <Flex justify='space-between'>
              <Text color='gray.500'>Juros</Text>
              <Text fontWeight='bold' color='gray.900'>
                {formatCurrency(interestAmount)}
              </Text>
            </Flex>
          )}

          <Flex borderTop='1px solid' borderColor='gray.200' mt='4px' />

          <Flex justify='space-between' align='center' gap="12px" minW="0">
            <Text fontSize='16px' fontWeight='bold' color='gray.900'>Total</Text>
            <Text fontSize={{ base: '18px', md: '20px' }} fontWeight='bold' color='#e27d35' textAlign="right">
              {formattedFinalTotal}
            </Text>
          </Flex>

          {checkoutOpen && (
            <Flex direction="column" gap="12px" borderTop="1px solid" borderColor="gray.200" pt="12px">
              <Text fontSize="14px" fontWeight="700" color="gray.900">
                Forma de pagamento
              </Text>

              <Flex direction="column" gap="8px">
                <Flex as="label" align="center" gap="8px" cursor="pointer">
                  <Box
                    as="input"
                    type="radio"
                    name="payment"
                    value="pix"
                    checked={paymentMethod === 'pix'}
                    onChange={() => {
                      setPaymentMethod('pix');
                      setInstallments(1);
                    }}
                  />
                  <Text fontSize="14px">PIX</Text>
                </Flex>

                <Flex as="label" align="center" gap="8px" cursor="pointer">
                  <Box
                    as="input"
                    type="radio"
                    name="payment"
                    value="credit-card"
                    checked={paymentMethod === 'credit-card'}
                    onChange={() => setPaymentMethod('credit-card')}
                  />
                  <Text fontSize="14px">Cartão de crédito</Text>
                </Flex>
              </Flex>

              {paymentMethod === 'credit-card' && (
                <Box>
                  <Text fontSize="14px" fontWeight="700" color="gray.900" mb="6px">
                    Parcelamento
                  </Text>
                  <Box
                    as="select"
                    value={installments}
                    onChange={(event) => setInstallments(Number(event.target.value))}
                    style={{
                      width: '100%',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '9px 10px',
                      fontSize: '14px',
                      outline: 'none',
                      background: 'white',
                    }}
                  >
                    {Array.from({ length: 12 }).map((_, index) => {
                      const installmentCount = index + 1;
                      const totalWithInterest = calculateInstallmentTotal(finalTotal, installmentCount);
                      const installmentValue = totalWithInterest / installmentCount;
                      const hasInterest = installmentCount > 3;

                      return (
                        <option key={installmentCount} value={installmentCount}>
                          {installmentCount}x de {formatCurrency(installmentValue)}{hasInterest ? ' com juros' : ' sem juros'}
                        </option>
                      );
                    })}
                  </Box>
                  {interestAmount > 0 && (
                    <Text fontSize="12px" color="gray.500" mt="6px">
                      Juros do parcelamento: {formatCurrency(interestAmount)}
                    </Text>
                  )}
                </Box>
              )}

              <Box>
                <Text fontSize="14px" fontWeight="700" color="gray.900" mb="6px">
                  Cupom
                </Text>
                <Flex gap="8px" direction={{ base: 'column', sm: 'row' }}>
                  <Box
                    as="input"
                    value={couponCode}
                    onChange={(event) => handleCouponChange(event.target.value)}
                    placeholder="Ex: XABLAU10"
                    style={{
                      width: '100%',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '9px 10px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  <Button borderRadius="8px" p="5px 10px" variant="outline" onClick={handleApplyCoupon} w={{ base: '100%', sm: 'auto' }}>
                    Aplicar
                  </Button>
                </Flex>
                {couponMessage && (
                  <Text
                    color={appliedCoupon ? 'green.600' : 'red.500'}
                    fontSize="13px"
                    fontWeight="600"
                    mt="6px"
                    overflowWrap="anywhere"
                    wordBreak="break-word"
                    whiteSpace="normal"
                  >
                    {couponMessage}
                  </Text>
                )}
              </Box>

              <Box>
                <Text fontSize="14px" fontWeight="700" color="gray.900" mb="6px">
                  CEP para entrega
                </Text>
                <Box
                  as="input"
                  value={cep}
                  onChange={(event) => setCep(event.target.value)}
                  placeholder="Ex: 90010150"
                  maxLength="8"
                  style={{
                    width: '100%',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '9px 10px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </Box>

              {checkoutMessage && (
                <Text
                  color="red.500"
                  fontSize="13px"
                  fontWeight="600"
                  maxW="100%"
                  minW="0"
                  overflowWrap="anywhere"
                  wordBreak="break-word"
                  whiteSpace="normal"
                >
                  {checkoutMessage}
                </Text>
              )}
            </Flex>
          )}

          <Button
            w='full'
            bg='linear-gradient(to top, #004d8e, #3695e3)'
            color='white'
            borderRadius='8px'
            fontSize='14px'
            fontWeight='600'
            mt='8px'
            _hover={{ bg: 'linear-gradient(to top, #00325a, #1f66a0)' }}
            _active={{ transform: 'scale(0.97)' }}
            onClick={checkoutOpen ? handleFinishPurchase : () => setCheckoutOpen(true)}
            disabled={isFinishing}
          >
            {checkoutOpen ? (isFinishing ? 'Finalizando...' : 'Confirmar compra') : 'Finalizar Compra'}
          </Button>

          <Button
            w='full'
            variant='outline'
            borderRadius='8px'
            onClick={clearCart}
          >
            Limpar Carrinho
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
