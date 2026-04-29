import '../../index.css'

import { Box, Flex, Text, Image, Button, Span } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { getProducts } from '../../features/products/products';

export function ProductCard({ product }) {
  const [added, setAdded] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);

  const handleAdd = async () => {
  await addToCart(product);
  setAdded(true);
  setTimeout(() => setAdded(false), 1000);
};

  return (
    <Flex
      direction='column'
      justifyContent='space-between'
      w='240px'
      bg='white'
      border='1px solid'
      borderColor='gray.200'
      borderRadius='14px'
      overflow='hidden'
      transition='all 0.25s'
      _hover={{ boxShadow: '0 8px 28px rgba(0,0,0,0.09)', transform: 'translateY(-4px)', border: '1px solid #e27d35' }}
      >
      <Flex bg='gray.50' h='180px' align='center' justify='center' p='16px'>
        <Image
          src={product.img}
          boxSize='140px'
          objectFit='cover'
          borderRadius='8px'
        />
      </Flex>

      <Box p='14px 16px 18px'>
        <Text fontSize='13px' color='gray.500' fontWeight='500' >
          {product.name}
        </Text>
        <Text fontSize='20px' fontWeight='700' color='gray.900' mb='14px'>
           {
           product.price.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
            })
            }
        </Text>
        <Text fontSize='12px' fontWeight='700' color='gray.900' mb='14px'>
          Em estoque: <Span color='green' fontSize="15px">
            { product.stock > 0 ? product.stock : <Span color='red' textDecoration='underline'>Esgotado</Span> }
            </Span>
        </Text>

        { product.stock > 0 ? 
        (
          <Button
            w='full'
            bg={added ? 'green.500' : 'linear-gradient(to top, #004d8e, #3695e3)'}
            color='white'
            borderRadius='8px'
            fontSize='13px'
            fontWeight='600'
            _hover={{ bg: added ? 'green.400' : 'linear-gradient(to top, #00325a, #1f66a0)' }}
            _active={{ transform: 'scale(0.97)' }}
            onClick={handleAdd}
          >

            {added ? 'Adicionado!' : 'Adicionar ao carrinho'}
          </Button>  
          )
          : '' 
        }
        

      </Box>
    </Flex>
  );
}

export function Home() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    async function loadProducts () {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (e) {
        console.error(e)
      }
    }

    loadProducts()
  }, [])

  return (
    <Box p='40px 24px'>
      <Text fontSize='22px' fontWeight='700' color='gray.900' mb='28px'>
        Mais Vendidos
      </Text>
      <Flex gap='16px' wrap='wrap'>
        {/* basicamente um "for" dos produtos */}
        {products.map((product) => ( <ProductCard key={product.id} product={product} /> )) }
      </Flex>
    </Box>
  );
}