import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { PRODUCT_SECTIONS } from '../../store/useProductSectionsStore';
import { useAdminProductFormStore } from '../../store/useAdminProductFormStore';

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

function AdminSelect(props) {
  return (
    <Box
      as="select"
      border="1px solid #cbd5e1"
      borderRadius="8px"
      p="9px 10px"
      fontSize="14px"
      outline="none"
      w="100%"
      bg="white"
      {...props}
    />
  );
}

export function AdminAddProduct() {
  const navigate = useNavigate();
  const form = useAdminProductFormStore((state) => state.form);
  const isSubmitting = useAdminProductFormStore((state) => state.isSubmitting);
  const message = useAdminProductFormStore((state) => state.message);
  const setField = useAdminProductFormStore((state) => state.setField);
  const submitProduct = useAdminProductFormStore((state) => state.submitProduct);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await submitProduct();
      navigate('/admin/produtos');
    } catch {
      // feedback already handled in the store message
    }
  };

  return (
    <Box p={{ base: '24px 16px', md: '32px 24px' }}>
      <Flex direction="column" gap="24px" maxW="980px" mx="auto">
        <Box>
          <Text fontSize={{ base: '24px', md: '28px' }} fontWeight="800" color="gray.900">
            Novo produto
          </Text>
          <Text color="gray.600">
            Cadastre um item novo para aparecer na loja.
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
              <Text fontSize="13px" fontWeight="700" mb="6px">Nome</Text>
              <AdminInput value={form.name} onChange={(event) => setField('name', event.target.value)} required />
            </Box>

            <Box flex="1 1 260px">
              <Text fontSize="13px" fontWeight="700" mb="6px">URL da imagem</Text>
              <AdminInput value={form.img} onChange={(event) => setField('img', event.target.value)} required />
            </Box>

            <Box flex="1 1 160px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Preço</Text>
              <AdminInput type="number" step="0.01" min="0" value={form.price} onChange={(event) => setField('price', event.target.value)} required />
            </Box>

            <Box flex="1 1 120px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Estoque</Text>
              <AdminInput type="number" min="0" value={form.stock} onChange={(event) => setField('stock', event.target.value)} required />
            </Box>

            <Box flex="1 1 190px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Categoria na Home</Text>
              <AdminSelect value={form.section} onChange={(event) => setField('section', event.target.value)}>
                {PRODUCT_SECTIONS.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.label}
                  </option>
                ))}
              </AdminSelect>
            </Box>
          </Flex>

          {message && (
            <Text fontWeight="700" color={message.includes('sucesso') ? 'green.600' : 'red.500'}>
              {message}
            </Text>
          )}

          <Flex gap="10px" wrap="wrap">
            <Button
              type="submit"
              bg="linear-gradient(to top, #004d8e, #3695e3)"
              color="white"
              borderRadius="8px"
              p="5px"
              isDisabled={isSubmitting}
              _hover={{ bg: 'linear-gradient(to top, #00325a, #1f66a0)' }}
            >
              {isSubmitting ? 'Salvando...' : 'Adicionar produto'}
            </Button>

            <Button type="button" variant="outline" borderRadius="8px" p="5px" onClick={() => navigate('/admin/produtos')}>
              Cancelar
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
