import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MdFavorite, MdFavoriteBorder, MdShoppingCart } from 'react-icons/md';
import { Box, Button, Flex, IconButton, Image, Spinner, Text } from '@chakra-ui/react';
import { PageLoadingBar } from '../../components/common/PageLoadingBar';
import { getProductById } from '../../features/products/products';
import { useCartStore } from '../../store/useCartStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';

export function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);
  const favoriteIds = useFavoritesStore((state) => state.productIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const favorite = product ? favoriteIds.includes(product.id) : false;

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch {
        setError('Produto não encontrado');
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setError('');
      await addToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1000);
    } catch {
      setError(localStorage.getItem('usuarioId') ? 'Quantidade máxima em estoque atingida' : 'Faça login para adicionar ao carrinho');
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="420px">
        <PageLoadingBar />
        <Spinner color="#e27d35" size="xl" />
      </Flex>
    );
  }

  if (!product) {
    return (
      <Flex direction="column" align="center" gap="16px" p="48px 24px">
        <Text fontSize="22px" fontWeight="700" color="gray.900">
          Produto não encontrado
        </Text>
        <Button as={Link} to="/" variant="outline" borderRadius="8px">
          Voltar para a loja
        </Button>
      </Flex>
    );
  }

  return (
    <Box p="40px 24px">
      <Flex
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="8px"
        maxW="1120px"
        mx="auto"
        p={{ base: '20px', md: '32px' }}
        gap={{ base: '24px', md: '40px' }}
        direction={{ base: 'column', md: 'row' }}
      >
        <Flex
          bg="gray.50"
          borderRadius="8px"
          align="center"
          justify="center"
          minH={{ base: '300px', md: '480px' }}
          flex="1"
          p="24px"
        >
          <Image
            src={product.img}
            alt={product.name}
            maxH={{ base: '280px', md: '430px' }}
            objectFit="contain"
          />
        </Flex>

        <Flex direction="column" flex="1" gap="18px">
          <Flex justify="space-between" align="flex-start" gap="12px">
            <Box>
              <Text fontSize={{ base: '22px', md: '28px' }} fontWeight="700" color="gray.900" lineHeight="1.2">
                {product.name}
              </Text>
              <Text color="gray.500" fontSize="14px" mt="8px">
                Código do produto: {product.id}
              </Text>
            </Box>

            <IconButton
              aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              variant="ghost"
              color="#e27d35"
              fontSize="32px"
              minW="44px"
              h="44px"
              borderRadius="8px"
              onClick={() => toggleFavorite(product.id)}
              _hover={{ bg: 'orange.50', transform: 'scale(1.05)' }}
            >
              {favorite ? <MdFavorite /> : <MdFavoriteBorder />}
            </IconButton>
          </Flex>

          <Text color="gray.600" lineHeight="1.6">
            {product.description || product.name}
          </Text>

          <Box>
            <Text fontSize="14px" color="gray.500">
              Preço no PIX
            </Text>
            <Text fontSize={{ base: '30px', md: '36px' }} fontWeight="800" color="#e27d35">
              {product.price.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </Box>

          <Text fontSize="14px" fontWeight="700" color={product.stock > 0 ? 'green.600' : 'red.500'}>
            {product.stock > 0 ? `${product.stock} unidades em estoque` : 'Produto esgotado'}
          </Text>

          {error && (
            <Text color="red.500" fontSize="14px" fontWeight="600">
              {error}
            </Text>
          )}

          <Button
            bg={added ? 'green.500' : 'linear-gradient(to top, #004d8e, #3695e3)'}
            color="white"
            borderRadius="8px"
            h="48px"
            fontSize="15px"
            fontWeight="700"
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
            _hover={{ bg: added ? 'green.400' : 'linear-gradient(to top, #00325a, #1f66a0)' }}
            _active={{ transform: 'scale(0.98)' }}
          >
            <MdShoppingCart size={20} />
            {added ? 'Adicionado!' : 'Adicionar ao carrinho'}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
