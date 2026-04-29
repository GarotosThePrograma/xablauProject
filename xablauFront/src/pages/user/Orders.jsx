import { useEffect } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrdersStore } from '../../store/useOrdersStore';

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function Orders() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const orders = useOrdersStore((state) => state.orders);
  const loadOrders = useOrdersStore((state) => state.loadOrders);

  useEffect(() => {
    loadOrders();
  }, [isLoggedIn, loadOrders]);

  return (
    <Flex justify="center" p="40px 24px">
      <Flex
        direction="column"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="8px"
        maxW="720px"
        w="100%"
        p="28px"
        gap="14px"
      >
        <Text fontSize="24px" fontWeight="700" color="gray.900">
          Meus pedidos
        </Text>

        {isLoggedIn && orders.length > 0 ? (
          <Flex direction="column" gap="14px">
            {orders.map((order) => (
              <Flex
                key={order.id}
                direction="column"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="8px"
                p="16px"
                gap="10px"
              >
                <Flex justify="space-between" gap="12px" wrap="wrap">
                  <Box>
                    <Text fontWeight="700" color="gray.900">
                      Pedido #{order.id.slice(0, 8)}
                    </Text>
                    <Text fontSize="13px" color="gray.500">
                      {new Date(order.date).toLocaleString('pt-BR')}
                    </Text>
                  </Box>
                  <Text fontWeight="800" color="#e27d35">
                    {formatCurrency(order.total)}
                  </Text>
                </Flex>

                <Text fontSize="14px" color="gray.600">
                  Pagamento: {order.paymentMethod === 'pix' ? 'PIX' : 'Cartão de crédito'}
                </Text>
                <Text fontSize="14px" color="gray.600">
                  Entrega: CEP {order.cep} - {order.shipping.label} ({formatCurrency(order.shipping.value)})
                </Text>

                <Flex direction="column" gap="6px">
                  {order.items.map((item) => (
                    <Flex key={item.id} justify="space-between" gap="12px">
                      <Text fontSize="14px" color="gray.700">
                        {item.quantity}x {item.name}
                      </Text>
                      <Text fontSize="14px" fontWeight="700">
                        {formatCurrency(item.price * item.quantity)}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </Flex>
            ))}
          </Flex>
        ) : isLoggedIn ? (
          <Box>
            <Text color="gray.600">
              Você ainda não tem pedidos finalizados.
            </Text>
          </Box>
        ) : (
          <Flex direction="column" align="flex-start" gap="14px">
            <Text color="gray.600">
              Entre na sua conta para acompanhar seus pedidos.
            </Text>
            <Button
              as={Link}
              to="/login"
              bg="linear-gradient(to top, #004d8e, #3695e3)"
              color="white"
              borderRadius="8px"
              _hover={{ bg: 'linear-gradient(to top, #00325a, #1f66a0)' }}
            >
              Entrar
            </Button>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
