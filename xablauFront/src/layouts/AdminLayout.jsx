import { Box, Flex, Text } from '@chakra-ui/react';
import { Link, Outlet } from 'react-router-dom';

export function AdminLayout() {
    const scrollToProducts = () => {
        document.getElementById('admin-products-list')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <Box mt="-124px" minH="100vh">
            <Flex
                as="header"
                align="center"
                justify="space-between"
                bg="#004d8e"
                color="white"
                h="72px"
                px="24px"
                borderBottom="2px solid #e27d35"
                position="fixed"
                top="0"
                left="0"
                right="0"
                zIndex="9999"
            >
                <Text fontSize="20px" fontWeight="700">
                    Admin Xablau
                </Text>

                <Flex gap="18px" fontSize="14px" fontWeight="600">
                    <Box as={Link} to="/" _hover={{ color: '#e27d35' }}>
                        Loja
                    </Box>
                    <Box
                        as="button"
                        type="button"
                        cursor="pointer"
                        onClick={scrollToProducts}
                        _hover={{ color: '#e27d35' }}
                    >
                        Produtos
                    </Box>
                </Flex>
            </Flex>

            <Box as="main" pt="72px">
                <Outlet />
            </Box>
        </Box>
    )
}
