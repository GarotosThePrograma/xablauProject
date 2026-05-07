import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Xablau } from '../components/common/Xablau.jsx';
import { UserCircle } from 'lucide-react';
import { MdShoppingCart, MdFavorite, MdMenu, MdClose } from 'react-icons/md';
import { Box, Flex, Input, IconButton, Text } from '@chakra-ui/react';
import { FlexHoverOrange } from '@/components/ui/FlexHoverOrange.jsx';
import { CartIcon } from '../components/common/CartIcon.jsx';
import { useAuthStore } from '../store/useAuthStore.js';
import { useFavoritesStore } from '../store/useFavoritesStore.js';

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const searchTerm = location.pathname === '/search'
    ? new URLSearchParams(location.search).get('q') ?? ''
    : '';
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const nome = useAuthStore((state) => state.nome);
  const logout = useAuthStore((state) => state.logout);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);
  const firstName = nome ? nome.split(' ')[0] : 'Minha conta';

  const handleLogout = () => {
    logout();
    clearFavorites();
    setAccountOpen(false);
    setMenuOpen(false);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    const trimmedValue = value.trim();
    const nextPath = trimmedValue ? `/search?q=${encodeURIComponent(value)}` : '/search';

    navigate(nextPath, { replace: location.pathname === '/search' });
  };

  return (
    <Box
      w="100%"
      bgGradient="to-b"
      gradientFrom="#3695e3"
      gradientTo={"#004d8e"}
      borderBottom= {menuOpen ? '' : '2px solid #e27d35' }
      h="124px"
      position='fixed'
      top='0'
      left='0'
      zIndex='9999'
      minW="0"
      overflow="visible"
    >
      {/* barra principal */}
      <Flex
        align="center"
        justify="space-between"
        px={{ base: 3, md: 6 }}
        gap={{ base: 2, md: 0 }}
        minW="0"
      >
        {/* logo */}
        <Box as="h1" color="white" m={0} flexShrink="0">
          <Link to={'/'}>
            <Xablau />
          </Link>
        </Box>

        {/* search */}
        <Box flexGrow={1} mx={{ base: 1, md: 4 }} maxW="700px" minW="0">
          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Busque na Xablau!"
            bg="aliceblue"
            border="1.5px solid lightgrey"
            borderRadius="12px"
            h="30px"
            px={3}
            minW="0"
            w="100%"
            _focus={{ outline: '1px solid #FE6C04' }}
            _active={{ transform: 'scale(0.95)' }}
            transition="all 0.3s cubic-bezier(0.19, 1, 0.22, 1)"
          />
        </Box>

        {/* itens desktop */}
        <Flex
          align="center"
          gap={5}
          display={{ base: 'none', md: 'flex'}}  
        >
          {isLoggedIn ? (
            <Box
              position="relative"
              zIndex="10001"
              onMouseEnter={() => setAccountOpen(true)}
              onMouseLeave={() => setAccountOpen(false)}
            >
              <FlexHoverOrange color="white">
                <UserCircle
                  size={42}
                  strokeWidth={1.5}
                />
                <Text as="span" fontSize="14px" lineHeight="1.1">
                  Olá,<br />{firstName}
                </Text>
              </FlexHoverOrange>

              {accountOpen && (
                <Box
                  position="absolute"
                  right="0"
                  top="100%"
                  pt="10px"
                  minW="170px"
                  zIndex="10001"
                >
                  <Flex
                    direction="column"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="8px"
                    boxShadow="0 12px 28px rgba(0,0,0,0.16)"
                    color="gray.800"
                    overflow="hidden"
                  >
                    <Box
                      as={Link}
                      to="/orders"
                      px="14px"
                      py="10px"
                      fontSize="14px"
                      _hover={{ bg: 'gray.50', color: '#e27d35' }}
                    >
                      Meus pedidos
                    </Box>
                    <Box
                      as="button"
                      type="button"
                      px="14px"
                      py="10px"
                      textAlign="left"
                      fontSize="14px"
                      cursor="pointer"
                      onClick={handleLogout}
                      _hover={{ bg: 'gray.50', color: '#e27d35' }}
                    >
                      Sair
                    </Box>
                  </Flex>
                </Box>
              )}
            </Box>
          ) : (
            <Flex
              as={Link}
              to="/login"
              align="center"
              gap={2}
              color="white"
              textDecoration="none"
            >
              <FlexHoverOrange color="white">
                  <UserCircle
                    size={42}
                    strokeWidth={1.5}
                  />
                  Entre<br />ou Cadastre-se
              </FlexHoverOrange>
            </Flex>
          )}

          <FlexHoverOrange as={Link} to="/favorites" gap={4} color="white">
            <MdFavorite size={30} />
          </FlexHoverOrange>

            <FlexHoverOrange gap={4} color="white">
              <CartIcon />
            </FlexHoverOrange>
          </Flex>


        {/* botão hamburguer */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          aria-label="Menu"
          variant="ghost"
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <MdClose size={32} /> : <MdMenu size={32} />}
        </IconButton>
      </Flex>

      {/* menu mobile */}
      <Box
        bg='#004d8e'
        display={{ base: 'block', md: 'none' }}
        zIndex='9999'
        overflow={menuOpen ? 'visible' : 'hidden'}
        maxH={menuOpen ? '260px' : '0'}
        opacity={menuOpen ? 1 : 0}
        transform={menuOpen ? 'translateY(0)' : 'translateY(-8px)'}
        borderTop={menuOpen ? '1px solid #004d8e' : '1px solid transparent'}
        borderBottom={menuOpen ? '2px solid #e27d35' : ''}
        px={{ base: 4, md: 6 }}
        py={menuOpen ? 4 : 0}
        transition="max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1), padding 0.3s ease"
      >
        <Flex justify="space-between" align="center" w='100%' gap="12px">
          {isLoggedIn ? (
            <Box
              position="relative"
              zIndex="10001"
              onMouseEnter={() => setAccountOpen(true)}
              onMouseLeave={() => setAccountOpen(false)}
            >
              <FlexHoverOrange color="white">
                <Flex justify='center' align='center' gap='5px'>
                  <UserCircle size={36} strokeWidth={1.5} />
                  <Box fontSize='13px'>Olá,<br />{firstName}</Box>
                </Flex>
              </FlexHoverOrange>

              {accountOpen && (
                <Box
                  position="absolute"
                  left="0"
                  top="100%"
                  pt="10px"
                  minW="160px"
                  zIndex="10001"
                >
                  <Flex
                    direction="column"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="8px"
                    boxShadow="0 12px 28px rgba(0,0,0,0.16)"
                    color="gray.800"
                    overflow="hidden"
                  >
                    <Box
                      as={Link}
                      to="/orders"
                      px="14px"
                      py="10px"
                      fontSize="14px"
                      onClick={() => setMenuOpen(false)}
                      _hover={{ bg: 'gray.50', color: '#e27d35' }}
                    >
                      Meus pedidos
                    </Box>
                    <Box
                      as="button"
                      type="button"
                      px="14px"
                      py="10px"
                      textAlign="left"
                      fontSize="14px"
                      cursor="pointer"
                      onClick={handleLogout}
                      _hover={{ bg: 'gray.50', color: '#e27d35' }}
                    >
                      Sair
                    </Box>
                  </Flex>
                </Box>
              )}
            </Box>
          ) : (
            <Flex
              as={Link}
              to="/login"
              justify="center"
              align="center"
              gap={2}
              color="white"
              textDecoration="none"
              onClick={() => setMenuOpen(false)}
            >
              <FlexHoverOrange color="white">
                <Flex justify='center' align='center' gap='5px'>
                  <UserCircle size={36} strokeWidth={1.5} />
                  <Box fontSize='13px'>Entre ou<br />Cadastre-se</Box>
                </Flex>
              </FlexHoverOrange>
            </Flex>
          )}
          
          <Flex gap={2} align='center' color='white'>
            <FlexHoverOrange as={Link} to="/favorites" onClick={() => setMenuOpen(false)}>
              <MdFavorite size={30} />
            </FlexHoverOrange>

            <Box onClick={() => setMenuOpen(false)}>
              <FlexHoverOrange>
                <CartIcon size={35} />
              </FlexHoverOrange>
            </Box>

          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
