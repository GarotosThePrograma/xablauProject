import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartProductCard } from "../../components/common/CartProductCard";
import { Flex, Text, Button, Box } from "@chakra-ui/react";
import { useCartStore } from "../../store/useCartStore";
import { useOrdersStore } from '../../store/useOrdersStore';

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

export function Cart() {
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const loadCart = useCartStore((state) => state.loadCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useOrdersStore((state) => state.addOrder);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [cep, setCep] = useState('');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const totalAmount = cart.reduce((acc, product) => {
    return acc + (product.price * product.quantity);
  }, 0);

  const shipping = calculateShipping(cep);
  const shippingAmount = shipping?.value ?? 0;
  const finalTotal = totalAmount + shippingAmount;
  const cepDigits = cep.replace(/\D/g, '');
  const formattedTotal = formatCurrency(totalAmount);
  const formattedFinalTotal = formatCurrency(finalTotal);

  const handleFinishPurchase = async () => {
    if (!shipping) {
      setCheckoutMessage('Digite um CEP válido com 8 números para calcular o frete.');
      return;
    }

    setIsFinishing(true);
    setCheckoutMessage('');

    try {
      addOrder({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        items: cart,
        paymentMethod,
        cep: cepDigits,
        shipping,
        subtotal: totalAmount,
        total: finalTotal,
      });
      await clearCart();
      navigate('/orders');
    } catch {
      setCheckoutMessage('Não foi possível finalizar a compra agora.');
    } finally {
      setIsFinishing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Flex direction="column" align="center" p="40px 24px" gap="24px">
        <Text fontSize="30px" fontWeight="bold" color="gray.900">
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
          p="28px"
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
    <Flex w='100%'>
      <Flex direction='column' alignItems='center' maxWidth='75%'>
        <Flex
          justify='center'
          alignItems='center'
          w='100vw'
          m='20px'
          fontSize='30px'
          fontWeight='bold'
        >
          Carrinho
        </Flex>

        <Flex direction='column'>
          {cart.map((product) => (
            <CartProductCard
              key={product.id}
              product={product}
            />
          ))}
        </Flex>
      </Flex>

      <Flex direction='column' alignItems='center' maxWidth='25%' h='85vh' p='20px'>
        <Flex
          direction='column'
          bg='white'
          border='1px solid'
          borderColor='gray.200'
          borderRadius='14px'
          p='24px'
          w='100%'
          gap='12px'
          marginTop='124px'
        >
          <Text fontSize='18px' fontWeight='bold' color='gray.900' mb='8px'>
            Resumo do Pedido
          </Text>

          <Flex justify='space-between'>
            <Text color='gray.500'>Subtotal</Text>
            <Text fontWeight='bold'>{formattedTotal}</Text>
          </Flex>

          <Flex justify='space-between'>
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

          <Flex borderTop='1px solid' borderColor='gray.200' mt='4px' />

          <Flex justify='space-between' align='center'>
            <Text fontSize='16px' fontWeight='bold' color='gray.900'>Total</Text>
            <Text fontSize='20px' fontWeight='bold' color='#e27d35'>
              {checkoutOpen && shipping ? formattedFinalTotal : formattedTotal}
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
                    onChange={() => setPaymentMethod('pix')}
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

              <Box>
                <Text fontSize="14px" fontWeight="700" color="gray.900" mb="6px">
                  CEP para entrega
                </Text>
                <Box
                  as="input"
                  value={cep}
                  onChange={(event) => setCep(event.target.value)}
                  placeholder="Ex: 90010-150"
                  maxLength="9"
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
                <Text color="red.500" fontSize="13px" fontWeight="600">
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
