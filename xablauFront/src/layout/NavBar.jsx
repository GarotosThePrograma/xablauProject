import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Xablau } from '../components/common/Xablau.jsx';
import { UserCircle } from 'lucide-react';
import { MdShoppingCart, MdFavorite, MdMenu, MdClose } from 'react-icons/md';
import { Box, Flex, Input, IconButton } from '@chakra-ui/react';
import { FlexHoverOrange } from '@/components/ui/FlexHoverOrange.jsx';
import { CartIcon } from '../components/common/CartIcon.jsx';

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const resizeTab = () => setIsMobile(window.innerWidth < 600);
    resizeTab();
    window.addEventListener('resize', resizeTab);
    return () => window.removeEventListener('resize', resizeTab);
  }, []);

  // fecha menu se redimensionar pra desktop
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

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
    >
      {/* barra principal */}
      <Flex
        align="center"
        justify="space-between"
        px={6}
      >
        {/* logo */}
        <Box as="h1" color="white" m={0}>
          <Link to={'/'}>
            <Xablau />
          </Link>
        </Box>

        {/* search */}
        <Box flexGrow={1} mx={4} maxW="700px">
          <Input
            placeholder="Busque na Xablau!"
            bg="aliceblue"
            border="1.5px solid lightgrey"
            borderRadius="12px"
            h="30px"
            px={3}
            minW="150px"
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
          <Flex
            as={Link}
            to="/login"
            align="center"
            gap={2}
            color="white"
            textDecoration="none"
          >
            <FlexHoverOrange>
                <UserCircle
                  size={42}
                  strokeWidth={1.5}
                />
                Entre<br />ou Cadastre-se
            </FlexHoverOrange>
          </Flex>

          <FlexHoverOrange gap={4} color="white">
            <MdFavorite size={30}  />
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
        overflow="hidden"
        maxH={menuOpen ? '200px' : '0'}
        opacity={menuOpen ? 1 : 0}
        transform={menuOpen ? 'translateY(0)' : 'translateY(-8px)'}
        borderTop={menuOpen ? '1px solid #004d8e' : '1px solid transparent'}
        borderBottom={menuOpen ? '2px solid #e27d35' : ''}
        px={menuOpen ? 6 : 6}
        py={menuOpen ? 4 : 0}
        transition="max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1), padding 0.3s ease"
      >
        <Flex justify="space-between" align="center" w='100%'>
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
            <FlexHoverOrange>
              <Flex justify='center' align='center' gap='5px'>
                <UserCircle size={36} strokeWidth={1.5} />
                <Box fontSize='13px'>Entre ou<br />Cadastre-se</Box>
              </Flex>
            </FlexHoverOrange>
          </Flex>
          
          <Flex gap={2} align='center' color='white'>
            <FlexHoverOrange>
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