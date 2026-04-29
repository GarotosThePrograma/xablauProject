import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { PageLoadingBar } from '../../components/common/PageLoadingBar';
import { ProductCard } from '../../components/common/ProductCard';
import { getProducts } from '../../features/products/products';
import { useFavoritesStore } from '../../store/useFavoritesStore';

function ProductCardSkeleton() {
  return (
    <Flex
      direction="column"
      justifyContent="space-between"
      w="240px"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="8px"
      overflow="hidden"
      animation="pulse 1.4s ease-in-out infinite"
    >
      <Flex bg="gray.50" h="180px" align="center" justify="center" p="16px">
        <Box w="140px" h="140px" bg="gray.200" borderRadius="8px" />
      </Flex>

      <Box p="14px 16px 18px">
        <Box h="14px" bg="gray.200" borderRadius="6px" mb="8px" />
        <Box h="14px" bg="gray.200" borderRadius="6px" w="80%" mb="16px" />
        <Box h="24px" bg="gray.200" borderRadius="6px" w="60%" mb="14px" />
        <Box h="14px" bg="gray.200" borderRadius="6px" w="48%" mb="14px" />
        <Box h="36px" bg="gray.200" borderRadius="8px" />
      </Box>
    </Flex>
  );
}

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
      <Box p="40px 24px">
        <PageLoadingBar />
        <Text fontSize="30px" fontWeight="bold" color="gray.900" mb="28px">
          Favoritos
        </Text>

        <Flex gap="16px" wrap="wrap">
          {Array.from({ length: Math.max(favoriteIds.length, 4) }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </Flex>
      </Box>
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
            p="5px"
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
