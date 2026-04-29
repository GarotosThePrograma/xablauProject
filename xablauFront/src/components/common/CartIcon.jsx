import { Box, Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { MdShoppingCart } from 'react-icons/md';


export function CartIcon({color, size = 35 }) {
    const cart = useCartStore((state) => state.cart);

    return (
        <Link to='cart'>
            <Box position="relative" display="inline-block" color={color}>
                <MdShoppingCart size={size} />
                
                {/* Renderiza a bolinha apenas se houver itens no carrinho */}
                {cart.length > 0 && (
                    <Flex
                    position="absolute"
                    top="-4px"
                    right="-6px"
                    bg="#FE6C04"
                    color="white"
                    borderRadius="full"
                    w="20px"
                    h="20px"
                    align="center"
                    justify="center"
                    fontSize="11px"
                    fontWeight="bold"
                    border="2px solid #3695e3" 
                    >
                    {cart.length > 99 ? '99+' : cart.length} 
                    </Flex>
                )}
            </Box>
        </Link>
    )
}