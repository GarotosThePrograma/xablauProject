import { useState } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/useAdminAuthStore';

export function AdminLogin() {
  const navigate = useNavigate();
  const loginAdmin = useAdminAuthStore((state) => state.loginAdmin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const success = loginAdmin(email, password);

    if (!success) {
      setError('Email ou senha de administrador inválidos');
      return;
    }

    navigate('/admin/produtos');
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="aliceblue" p={{ base: '16px', md: '24px' }} mt="-124px">
      <Flex
        as="form"
        onSubmit={handleSubmit}
        direction="column"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="8px"
        boxShadow="0 8px 28px rgba(0,0,0,0.09)"
        maxW="420px"
        w="100%"
        p={{ base: '22px', md: '28px' }}
        gap="16px"
      >
        <Box textAlign="center">
          <Text fontSize="24px" fontWeight="800" color="gray.900">
            Admin Xablau
          </Text>
          <Text color="gray.600" fontSize="14px">
            Acesse o painel de produtos
          </Text>
        </Box>

        <Box>
          <Text fontSize="14px" fontWeight="700" mb="6px">Email</Text>
          <Box
            as="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            border="1px solid #cbd5e1"
            borderRadius="8px"
            p="10px 12px"
            w="100%"
            required
          />
        </Box>

        <Box>
          <Text fontSize="14px" fontWeight="700" mb="6px">Senha</Text>
          <Box
            as="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            border="1px solid #cbd5e1"
            borderRadius="8px"
            p="10px 12px"
            w="100%"
            required
          />
        </Box>

        {error && (
          <Text color="red.500" fontSize="14px" fontWeight="700">
            {error}
          </Text>
        )}

        <Button
          type="submit"
          bg="linear-gradient(to top, #004d8e, #3695e3)"
          color="white"
          borderRadius="8px"
          _hover={{ bg: 'linear-gradient(to top, #00325a, #1f66a0)' }}
        >
          Entrar
        </Button>
      </Flex>
    </Flex>
  );
}
