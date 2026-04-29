import '../../index.css'

import { Box, Flex, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ProductCard } from '../../components/common/ProductCard';
import { getProducts } from '../../features/products/products';

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
        {products
          .toSorted((a, b) => {
            if (a.stock > 0 && b.stock <= 0) return -1;
            if (a.stock <= 0 && b.stock > 0) return 1;
            return a.id - b.id;
          })
          .map((product) => ( <ProductCard key={product.id} product={product} /> )) }
      </Flex>
    </Box>
  );
}
