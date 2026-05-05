import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Flex, Text } from '@chakra-ui/react';

import { loginSchema } from './schemas/authSchema'
import { PageLoadingBar } from '../../../components/common/PageLoadingBar';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import { ToastContainer } from '../../../components/common/ToastContainer';
import { useToastStore } from '../../../store/useToastStore';

function getFirstErrorMessage(formErrors) {
  return Object.values(formErrors).find((error) => error?.message)?.message;
}


export function Login() {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const loginAdmin = useAdminAuthStore((state) => state.loginAdmin);
  const logoutAdmin = useAdminAuthStore((state) => state.logoutAdmin);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  const {
    register,

    // faz os dados passarem pela regras que criei fora do componente, caso reprove joga isso dentro do errors
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema), // o RHF agora sabe que deve usar o Zod
  });

  const lidarComErros = (formErrors) => {
    const message = getFirstErrorMessage(formErrors) || 'Revise os campos destacados.';

    setFeedback({ type: 'error', message });
  };

  const enviarDados = async (dadosValidados) => {
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const adminLoggedIn = loginAdmin(dadosValidados.email, dadosValidados.password);

      if (adminLoggedIn) {
        logout();
        setFeedback({ type: 'success', message: 'Login de administrador realizado com sucesso' });
        window.location.assign('/admin/produtos');
        return;
      }

      logoutAdmin();

      const response = await fetch('http://localhost:5002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: dadosValidados.email,
          senha: dadosValidados.password,
        }),
      });

      const data = await response.json();

      if (data.sucesso) {
        login({
          usuarioId: data.usuarioId,
          nome: data.nome,
          email: data.email,
        });

        setFeedback({ type: 'success', message: data.mensagem || 'Login realizado com sucesso' });
        window.location.assign('/');
        return;
      }

      const message = data.mensagem || 'Email ou senha inválidos';
      setFeedback({ type: 'error', message });
    } catch {
      const message = 'Não foi possível conectar ao servidor';
      showToast({
        type: 'error',
        title: 'Não foi possível conectar ao servidor',
        message: 'Tente novamente mais tarde'
      });
      setFeedback({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Flex
      minH="calc(100vh - 124px)"
      align={{ base: 'flex-start', md: 'center' }}
      justify="center"
      bg="#f8fafc"
      p={{ base: '28px 16px', md: '24px' }}
    >
      {isSubmitting && <PageLoadingBar />}

      <Flex
        as="form"
        onSubmit={handleSubmit(enviarDados, lidarComErros)}
        noValidate
        direction="column"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="12px"
        boxShadow="0 4px 12px rgba(15, 23, 42, 0.10)"
        maxW="400px"
        w="100%"
        minW="0"
        p={{ base: '22px', md: '32px' }}
        gap={{ base: '16px', md: '20px' }}
      >
        <Box textAlign="center" mb="4px">
          <Text fontSize={{ base: '22px', md: '24px' }} fontWeight="800" color="gray.900">
            Acesse sua conta
          </Text>
          <Text color="gray.500" fontSize="14px" mt="6px">
            Digite seu e-mail e senha abaixo para entrar
          </Text>
        </Box>

        <Flex direction="column" gap="8px">
          <Text as="label" htmlFor="email" fontSize="14px" fontWeight="700" color="gray.900">
            E-mail
          </Text>
          <Box
            as="input"
            id="email"
            type="email"
            placeholder="seuemail@aqui.com"
            autoComplete="off"
            border="1px solid"
            borderColor={errors.email ? 'red.300' : 'gray.300'}
            borderRadius="8px"
            p="10px 12px"
            fontSize="14px"
            outline="none"
            minW="0"
            _focus={{ borderColor: '#004d8e', boxShadow: '0 0 0 2px rgba(0, 77, 142, 0.12)' }}
            {...register("email")}
          />
          {errors.email && (
            <Text color="red.500" fontSize="13px" fontWeight="700">
              {errors.email.message}
            </Text>
          )}
        </Flex>

        <Flex direction="column" gap="8px">
          <Text as="label" htmlFor="password" fontSize="14px" fontWeight="700" color="gray.900">
            Senha
          </Text>
          <Box
            as="input"
            id="password"
            type="password"
            placeholder="••••••••"
            border="1px solid"
            borderColor={errors.password ? 'red.300' : 'gray.300'}
            borderRadius="8px"
            p="10px 12px"
            fontSize="14px"
            outline="none"
            minW="0"
            _focus={{ borderColor: '#004d8e', boxShadow: '0 0 0 2px rgba(0, 77, 142, 0.12)' }}
            {...register("password")}
          />
          {errors.password && (
            <Text color="red.500" fontSize="13px" fontWeight="700">
              {errors.password.message}
            </Text>
          )}
        </Flex>

        {feedback.message && (
          <Text
            borderRadius="8px"
            fontSize="14px"
            fontWeight="700"
            p="10px 12px"
            bg={feedback.type === 'success' ? 'green.100' : 'red.100'}
            color={feedback.type === 'success' ? 'green.700' : 'red.700'}
            overflowWrap="anywhere"
            wordBreak="break-word"
          >
            {feedback.message}
          </Text>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          bg="linear-gradient(to top, #004d8e, #3695e3)"
          color="white"
          borderRadius="8px"
          fontWeight="700"
          minH="42px"
          _hover={{ bg: 'linear-gradient(to top, #00325a, #1f66a0)' }}
          _disabled={{ opacity: 0.75, cursor: 'not-allowed' }}
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>

        <Text fontSize="14px" color="gray.600" textAlign="center">
          Não tem uma conta?{' '}
          <Box as={Link} to="/register" color="#3695e3" fontWeight="700" _hover={{ textDecoration: 'underline' }}>
            Cadastre-se
          </Box>
        </Text>
      </Flex>
    </Flex>
  );
}
