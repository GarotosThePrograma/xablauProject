import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Flex, Spinner, Text } from '@chakra-ui/react';
import { ProductCard } from '../../components/common/ProductCard';
import { getProducts } from '../../features/products/products';
import { useFavoritesStore } from '../../store/useFavoritesStore';

export function Favorites() {
  const favoriteIds = useFavoritesStore((state) => state.productIds);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(favoriteIds.length > 0);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProducts() {
      if (favoriteIds.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getProducts();
        setProducts(data);
      } catch {
        setError('Não foi possível carregar seus favoritos');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [favoriteIds.length]);

  const favoriteProducts = useMemo(() => {
    return products.filter((product) => favoriteIds.includes(product.id));
  }, [favoriteIds, products]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="360px">
        <Spinner color="#e27d35" size="xl" />
      </Flex>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <Flex direction="column" align="center" p="40px 24px" gap="24px">
        <Text fontSize="30px" fontWeight="bold" color="gray.900">
          Favoritos
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
              Nenhum favorito ainda
            </Text>
            <Text color="gray.600" mt="6px">
              Toque no coração de um produto para guardar ele aqui.
            </Text>
            {error && (
              <Text color="red.500" fontWeight="600" mt="10px">
                {error}
              </Text>
            )}
          </Box>

          <Button
            as={Link}
            to="/"
            bg="linear-gradient(to top, #004d8e, #3695e3)"
            color="white"
            borderRadius="8px"
            _hover={{ bg: 'linear-gradient(to top, #00325a, #1f66a0)' }}
          >
            Ver produtos
          </Button>
        </Flex>
      </Flex>
    );
  }

  return (
    <Box p="40px 24px">
      <Text fontSize="30px" fontWeight="bold" color="gray.900" mb="28px">
        Favoritos
      </Text>

      <Flex gap="16px" wrap="wrap">
        {favoriteProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Flex>
    </Box>
  );
}
