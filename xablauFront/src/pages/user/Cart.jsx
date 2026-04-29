import { useEffect } from 'react';
import { CartProductCard } from "../../components/common/CartProductCard";
import { Flex, Text, Button } from "@chakra-ui/react";
import { useCartStore } from "../../store/useCartStore";

export function Cart() {
  const cart = useCartStore((state) => state.cart);
  const loadCart = useCartStore((state) => state.loadCart);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const totalAmount = cart.reduce((acc, product) => {
    return acc + (product.price * product.quantity);
  }, 0);

  const formattedTotal = totalAmount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

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
            <Text fontWeight='bold' color='green.500'>Grátis</Text>
          </Flex>

          <Flex borderTop='1px solid' borderColor='gray.200' mt='4px' />

          <Flex justify='space-between' align='center'>
            <Text fontSize='16px' fontWeight='bold' color='gray.900'>Total</Text>
            <Text fontSize='20px' fontWeight='bold' color='#e27d35'>{formattedTotal}</Text>
          </Flex>

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
          >
            Finalizar Compra
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
