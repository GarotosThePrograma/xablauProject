import { Box, Button, Flex, IconButton, Image, Span, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { useCartStore } from '../../store/useCartStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';

export function ProductCard({ product }) {
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  const addToCart = useCartStore((state) => state.addToCart);
  const favoriteIds = useFavoritesStore((state) => state.productIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const favorite = favoriteIds.includes(product.id);

  const handleAdd = async () => {
    try {
      setError('');
      await addToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1000);
    } catch {
      setError(localStorage.getItem('usuarioId') ? 'Quantidade máxima em estoque atingida' : 'Faça login para adicionar ao carrinho');
      setTimeout(() => setError(''), 2200);
    }
  };

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
      position="relative"
      opacity={product.stock > 0 ? 1 : 0.52}
      filter={product.stock > 0 ? 'none' : 'grayscale(0.55)'}
      transition="all 0.25s"
      _hover={{ boxShadow: '0 8px 28px rgba(0,0,0,0.09)', transform: 'translateY(-4px)', border: '1px solid #e27d35', opacity: product.stock > 0 ? 1 : 0.68 }}
    >
      <IconButton
        aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        position="absolute"
        top="10px"
        right="10px"
        zIndex="1"
        bg="white"
        color="#e27d35"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="8px"
        minW="36px"
        h="36px"
        onClick={() => toggleFavorite(product.id)}
        _hover={{ bg: 'orange.50', transform: 'scale(1.05)' }}
      >
        {favorite ? <MdFavorite size={22} /> : <MdFavoriteBorder size={22} />}
      </IconButton>

      <Flex
        as={Link}
        to={`/product/${product.id}`}
        bg="gray.50"
        h="180px"
        align="center"
        justify="center"
        p="16px"
      >
        <Image
          src={product.img}
          alt={product.name}
          boxSize="140px"
          objectFit="cover"
          borderRadius="8px"
        />
      </Flex>

      <Box p="14px 16px 18px">
        <Text
          as={Link}
          to={`/product/${product.id}`}
          display="block"
          fontSize="13px"
          color="gray.500"
          fontWeight="500"
          _hover={{ color: '#e27d35' }}
        >
          {product.name}
        </Text>
        <Text fontSize="20px" fontWeight="700" color="gray.900" mb="14px">
          {product.price.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </Text>
        <Text fontSize="12px" fontWeight="700" color="gray.900" mb="14px">
          Em estoque:{' '}
          <Span color={product.stock > 0 ? 'green' : 'red'} fontSize="15px">
            {product.stock > 0 ? product.stock : 'Esgotado'}
          </Span>
        </Text>

        {error && (
          <Text color="red.500" fontSize="12px" fontWeight="600" mb="10px">
            {error}
          </Text>
        )}

        {product.stock > 0 && (
          <Button
            w="full"
            bg={added ? 'green.500' : 'linear-gradient(to top, #004d8e, #3695e3)'}
            color="white"
            borderRadius="8px"
            fontSize="13px"
            fontWeight="600"
            _hover={{ bg: added ? 'green.400' : 'linear-gradient(to top, #00325a, #1f66a0)' }}
            _active={{ transform: 'scale(0.97)' }}
            onClick={handleAdd}
          >
            {added ? 'Adicionado!' : 'Adicionar ao carrinho'}
          </Button>
        )}
      </Box>
    </Flex>
  );
}
