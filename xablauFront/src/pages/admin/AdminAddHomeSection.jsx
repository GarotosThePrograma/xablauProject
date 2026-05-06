import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { Layers3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminHomeSectionsStore } from '../../store/useAdminHomeSectionsStore';

function AdminInput(props) {
  return (
    <Box
      as="input"
      border="1px solid #cbd5e1"
      borderRadius="8px"
      p="9px 10px"
      fontSize="14px"
      outline="none"
      w="100%"
      {...props}
    />
  );
}

export function AdminAddHomeSection() {
  const navigate = useNavigate();
  const form = useAdminHomeSectionsStore((state) => state.form);
  const isSubmitting = useAdminHomeSectionsStore((state) => state.isSubmitting);
  const setField = useAdminHomeSectionsStore((state) => state.setField);
  const submitSection = useAdminHomeSectionsStore((state) => state.submitSection);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await submitSection();
      navigate('/admin/secoes');
    } catch {
      // feedback already handled in the store message
    }
  };

  return (
    <Box p={{ base: '24px 16px', md: '32px 24px' }}>
      <Flex direction="column" gap="24px" maxW="980px" mx="auto">
        <Box>
          <Text fontSize={{ base: '24px', md: '28px' }} fontWeight="800" color="gray.900">
            Nova seção
          </Text>
          <Text color="gray.600">
            Cadastre uma nova seção para aparecer como faixa na home e nos formulários do admin.
          </Text>
        </Box>

        <Flex
          as="form"
          onSubmit={handleSubmit}
          direction="column"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="8px"
          p={{ base: '16px', md: '20px' }}
          gap="12px"
        >
          <Flex gap="12px" wrap="wrap">
            <Box flex="1 1 260px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Nome da seção</Text>
              <AdminInput
                value={form.label}
                onChange={(event) => setField('label', event.target.value)}
                placeholder="Ex.: Hardware"
                required
              />
            </Box>
          </Flex>

          <Flex gap="10px" wrap="wrap">
            <Button
              type="submit"
              leftIcon={<Layers3 size={16} />}
              bg="linear-gradient(to top, #004d8e, #3695e3)"
              color="white"
              borderRadius="8px"
              p="5px"
              isDisabled={isSubmitting}
              _hover={{ bg: 'linear-gradient(to top, #00325a, #1f66a0)' }}
            >
              {isSubmitting ? 'Salvando...' : 'Adicionar seção'}
            </Button>

            <Button
                type="button"
                variant="outline"
                borderRadius="8px"
                p="5px"
                onClick={() => navigate('/admin/secoes')}
                title='Voltar'
            >
              Cancelar
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
