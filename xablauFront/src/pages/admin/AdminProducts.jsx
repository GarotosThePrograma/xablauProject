import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Flex, IconButton, Image, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { LuPencil } from 'react-icons/lu';
import { getProducts } from '../../services/productsApi';

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch {
      setMessage('Não foi possível carregar os produtos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <Box p={{ base: '24px 16px', md: '32px 24px' }}>
      <Flex direction="column" gap="24px" maxW="1180px" mx="auto">
        <Flex align={{ base: 'stretch', md: 'flex-end' }} justify="space-between" gap="12px" wrap="wrap">
          <Box>
            <Text fontSize={{ base: '24px', md: '28px' }} fontWeight="800" color="gray.900">
              Produtos
            </Text>
            <Text color="gray.600">
              Visualize os produtos cadastrados e abra a página de edição quando precisar ajustar algo.
            </Text>
          </Box>

          <Button
            as={Link}
            to="/admin/produtos/novo"
            bg="linear-gradient(to top, #004d8e, #3695e3)"
            color="white"
            borderRadius="8px"
            p="5px"
            _hover={{ bg: 'linear-gradient(to top, #00325a, #1f66a0)' }}
          >
            Novo produto
          </Button>
        </Flex>

        {message && (
          <Text fontWeight="700" color="red.500">
            {message}
          </Text>
        )}

        <Flex id="admin-products-list" direction="column" gap="12px" scrollMarginTop="90px">
          <Text fontSize="18px" fontWeight="700" color="gray.900">
            Produtos cadastrados
          </Text>

          {isLoading ? (
            <Text color="gray.600">Carregando produtos...</Text>
          ) : (
            products.map((product) => (
              <Flex
                key={product.id}
                align={{ base: 'stretch', md: 'center' }}
                gap="14px"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="8px"
                p="14px"
                wrap="wrap"
              >
                <Image
                  src={product.img}
                  alt={product.name}
                  boxSize="72px"
                  objectFit="contain"
                  bg="gray.50"
                  borderRadius="8px"
                  alignSelf={{ base: 'center', md: 'auto' }}
                />
                <Box flex="1 1 220px" minW="0">
                  <Text fontWeight="700" color="gray.900" overflowWrap="anywhere" wordBreak="break-word">
                    {product.name}
                  </Text>
                  <Text color="#e27d35" fontWeight="800">
                    {formatCurrency(Number(product.price))}
                  </Text>
                  <Text color="gray.500" fontSize="13px" mt="4px">
                    Estoque: {product.stock}
                  </Text>
                </Box>

                <IconButton
                  as={Link}
                  to={`/admin/produtos/editar/${product.id}`}
                  aria-label={`Editar ${product.name}`}
                  variant="ghost"
                  borderRadius="full"
                  color="#004d8e"
                  _hover={{ bg: 'orange.50', color: '#e27d35', transform: 'translateY(-1px)' }}
                >
                  <LuPencil />
                </IconButton>
              </Flex>
            ))
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
