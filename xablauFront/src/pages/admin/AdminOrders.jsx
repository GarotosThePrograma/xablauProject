import { useEffect } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useOrdersStore } from '../../store/useOrdersStore';

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function AdminOrders() {
  const orders = useOrdersStore((state) => state.orders);
  const isLoading = useOrdersStore((state) => state.isLoading);
  const error = useOrdersStore((state) => state.error);
  const loadAdminOrders = useOrdersStore((state) => state.loadAdminOrders);

  useEffect(() => {
    loadAdminOrders();
  }, [loadAdminOrders]);

  return (
    <Box p={{ base: '24px 16px', md: '32px 24px' }}>
      <Flex direction="column" gap="24px" maxW="1180px" mx="auto">
        <Box>
          <Text fontSize={{ base: '24px', md: '28px' }} fontWeight="800" color="gray.900">
            Pedidos
          </Text>
          <Text color="gray.600">
            Acompanhe compras finalizadas pelos clientes.
          </Text>
        </Box>

        {isLoading ? (
          <Text color="gray.600">Carregando pedidos...</Text>
        ) : error ? (
          <Text color="red.500" fontWeight="700">{error}</Text>
        ) : orders.length === 0 ? (
          <Flex
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="8px"
            p="20px"
          >
            <Text color="gray.600">Nenhum pedido finalizado ainda.</Text>
          </Flex>
        ) : (
          <Flex direction="column" gap="14px">
            {orders.map((order) => (
              <Flex
                key={order.id}
                direction="column"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="8px"
                p={{ base: '14px', md: '18px' }}
                gap="14px"
                minW="0"
              >
                <Flex justify="space-between" align="flex-start" gap="16px" wrap="wrap">
                  <Box minW="0">
                    <Text fontSize="18px" fontWeight="800" color="gray.900">
                      Pedido #{String(order.id).padStart(4, '0')}
                    </Text>
                    <Text color="gray.600" fontSize="14px">
                      {new Date(order.date).toLocaleString('pt-BR')}
                    </Text>
                    <Text color="gray.700" fontSize="14px" mt="6px" overflowWrap="anywhere" wordBreak="break-word">
                      {order.usuarioNome || 'Cliente'} - {order.usuarioEmail || 'email não informado'}
                    </Text>
                  </Box>

                  <Box textAlign={{ base: 'left', md: 'right' }} minW="0">
                    <Text fontSize="22px" fontWeight="900" color="#e27d35">
                      {formatCurrency(order.total)}
                    </Text>
                    <Text color="gray.600" fontSize="13px">
                      {order.paymentMethod === 'pix' ? 'PIX' : `Cartão ${order.installments}x`}
                    </Text>
                  </Box>
                </Flex>

                <Flex gap="12px" wrap="wrap" color="gray.600" fontSize="14px">
                  <Text>CEP {order.cep}</Text>
                  <Text overflowWrap="anywhere" wordBreak="break-word">{order.shipping.label}: {formatCurrency(order.shipping.value)}</Text>
                  {order.coupon && (
                    <Text
                      color="green.600"
                      fontWeight="700"
                      overflowWrap="anywhere"
                      wordBreak="break-word"
                    >
                      Cupom {order.coupon.code}: -{formatCurrency(order.discount)}
                    </Text>
                  )}
                  {order.interest > 0 && (
                    <Text>Juros: {formatCurrency(order.interest)}</Text>
                  )}
                </Flex>

                <Flex direction="column" gap="8px">
                  {order.items.map((item) => (
                    <Flex key={`${order.id}-${item.id}`} justify="space-between" gap="12px" wrap="wrap">
                      <Text color="gray.700" fontSize="14px" minW="0" overflowWrap="anywhere" wordBreak="break-word">
                        {item.quantity}x {item.name}
                      </Text>
                      <Text fontWeight="800" color="gray.900" fontSize="14px" flexShrink="0">
                        {formatCurrency(item.subtotal)}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </Flex>
            ))}
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
