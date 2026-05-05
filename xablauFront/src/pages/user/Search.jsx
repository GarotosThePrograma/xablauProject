import { Box, Flex, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLoadingBar } from '../../components/common/PageLoadingBar';
import { ProductCard } from '../../components/common/ProductCard';
import { getProducts } from '../../services/productsApi';

function ProductCardSkeleton() {
  return (
    <Flex
      direction="column"
      justifyContent="space-between"
      w={{ base: '100%', md: '240px' }}
      maxW={{ base: '340px', md: '240px' }}
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

export function Search() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchTerm = searchParams.get('q') ?? '';
  const normalizedSearch = searchTerm.trim().toLowerCase();

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!normalizedSearch) {
      return [];
    }

    return products.filter((product) => {
      const searchableText = `${product.name ?? ''} ${product.description ?? ''}`.toLowerCase();
      return searchableText.includes(normalizedSearch);
    });
  }, [normalizedSearch, products]);

  return (
    <Box p={{ base: '28px 16px', md: '40px 24px' }}>
      {isLoading && <PageLoadingBar />}

      <Text fontSize={{ base: '24px', md: '28px' }} fontWeight="800" color="gray.900" mb="8px">
        Pesquisa
      </Text>

      <Text
        color="gray.600"
        fontSize="15px"
        mb="28px"
        overflowWrap="anywhere"
        wordBreak="break-word"
        whiteSpace="normal"
      >
        {normalizedSearch
          ? `${filteredProducts.length} resultado(s) para "${searchTerm}"`
          : 'Digite o nome de um produto na busca.'}
      </Text>

      {isLoading ? (
        <Flex gap="16px" wrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </Flex>
      ) : (
        <>
          {normalizedSearch && filteredProducts.length > 0 && (
            <Flex gap="16px" wrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Flex>
          )}

          {normalizedSearch && filteredProducts.length === 0 && (
            <Flex
              direction="column"
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="8px"
              p={{ base: '20px', md: '28px' }}
              maxW="720px"
              gap="6px"
            >
              <Text fontSize="20px" fontWeight="700" color="gray.900">
                Nenhum produto encontrado
              </Text>
              <Text color="gray.600">
                Tente pesquisar por outro nome ou categoria.
              </Text>
            </Flex>
          )}
        </>
      )}
    </Box>
  );
}
