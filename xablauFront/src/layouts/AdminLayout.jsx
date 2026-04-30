import { Box, Flex, Text } from '@chakra-ui/react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/useAdminAuthStore';

export function AdminLayout() {
    const navigate = useNavigate();
    const logoutAdmin = useAdminAuthStore((state) => state.logoutAdmin);

    const scrollToProducts = () => {
        const productsList = document.getElementById('admin-products-list');

        if (!productsList) {
            navigate('/admin/produtos');
            return;
        }

        productsList.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    const handleLogout = () => {
        logoutAdmin();
        navigate('/login');
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
                    <Box as={Link} to="/admin/pedidos" _hover={{ color: '#e27d35' }}>
                        Pedidos
                    </Box>
                    <Box
                        as="button"
                        type="button"
                        cursor="pointer"
                        onClick={handleLogout}
                        _hover={{ color: '#e27d35' }}
                    >
                        Sair
                    </Box>
                </Flex>
            </Flex>

            <Box as="main" pt="72px">
                <Outlet />
            </Box>
        </Box>
    )
}
