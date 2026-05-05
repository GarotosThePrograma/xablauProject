import { useEffect } from 'react';
import { Box, Button, Flex, Image, Spinner, Text } from '@chakra-ui/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PRODUCT_SECTIONS } from '../../store/useProductSectionsStore';
import { useAdminEditProductStore } from '../../store/useAdminEditProductStore';
import { Trash2, Undo2 } from 'lucide-react';

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

export function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const form = useAdminEditProductStore((state) => state.form);
  const isLoading = useAdminEditProductStore((state) => state.isLoading);
  const isSubmitting = useAdminEditProductStore((state) => state.isSubmitting);
  const message = useAdminEditProductStore((state) => state.message);
  const setField = useAdminEditProductStore((state) => state.setField);
  const loadProduct = useAdminEditProductStore((state) => state.loadProduct);
  const updateCurrentProduct = useAdminEditProductStore((state) => state.updateCurrentProduct);
  const deleteCurrentProduct = useAdminEditProductStore((state) => state.deleteCurrentProduct);
  const reset = useAdminEditProductStore((state) => state.reset);

  useEffect(() => {
    loadProduct(id);

    return () => {
      reset();
    };
  }, [id, loadProduct, reset]);

  const handleUpdate = async () => {
    await updateCurrentProduct();
  };

  const handleDelete = async () => {
    const deleted = await deleteCurrentProduct();

    if (deleted) {
      navigate('/admin/produtos');
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="420px">
        <Spinner color="#e27d35" size="xl" />
      </Flex>
    );
  }

  if (!form.id) {
    return (
      <Flex direction="column" align="center" gap="16px" p="48px 24px">
        <Text fontSize="22px" fontWeight="700" color="gray.900">
          Produto não encontrado
        </Text>
        {message && (
          <Text color="red.500" fontWeight="600">{message}</Text>
        )}
        <Button as={Link} to="/admin/produtos" variant="outline" borderRadius="8px">
          Voltar para produtos
        </Button>
      </Flex>
    );
  }

  return (
    <Box p={{ base: '28px 16px', md: '40px 24px' }}>
      <Flex
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="8px"
        maxW="1120px"
        mx="auto"
        p={{ base: '18px', md: '32px' }}
        gap={{ base: '24px', md: '40px' }}
        direction={{ base: 'column', md: 'row' }}
      >
        <Flex
          bg="gray.50"
          borderRadius="8px"
          align="center"
          justify="center"
          minH={{ base: '240px', md: '460px' }}
          flex="1"
          p="24px"
        >
          <Image
            src={form.img}
            alt={form.name}
            maxH={{ base: '220px', md: '420px' }}
            maxW="100%"
            objectFit="contain"
          />
        </Flex>

        <Flex direction="column" flex="1" gap="18px" minW="0">
          <Box>
            <Text fontSize={{ base: '22px', md: '28px' }} fontWeight="700" color="gray.900" lineHeight="1.2">
              Editar produto
            </Text>
            <Text color="gray.500" fontSize="14px" mt="8px">
              Código do produto: {form.id}
            </Text>
          </Box>

          <Box>
            <Text fontSize="13px" fontWeight="700" mb="6px">Nome</Text>
            <AdminInput value={form.name} onChange={(event) => setField('name', event.target.value)} />
          </Box>

          <Box>
            <Text fontSize="13px" fontWeight="700" mb="6px">URL da imagem</Text>
            <AdminInput value={form.img} onChange={(event) => setField('img', event.target.value)} />
          </Box>

          <Flex gap="12px" wrap="wrap">
            <Box flex="1 1 160px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Preço</Text>
              <AdminInput type="number" step="0.01" min="0" value={form.price} onChange={(event) => setField('price', event.target.value)} />
            </Box>

            <Box flex="1 1 140px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Estoque</Text>
              <AdminInput type="number" min="0" value={form.stock} onChange={(event) => setField('stock', event.target.value)} />
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
            <Text color={message.includes('atualizado') || message.includes('removido') ? 'green.600' : 'red.500'} fontWeight="700">
              {message}
            </Text>
          )}

          <Flex gap="10px" wrap="wrap">
            <Button
              bg="linear-gradient(to top, #004d8e, #3695e3)"
              color="white"
              borderRadius="8px"
              h="44px"
              p="5px"
              fontWeight="700"
              isDisabled={isSubmitting}
              onClick={handleUpdate}
              _hover={{ bg: 'linear-gradient(to top, #00325a, #1f66a0)' }}
            >
              {isSubmitting ? 'Salvando...' : 'Atualizar'}
            </Button>
            <Button
              colorPalette="red"
              borderRadius="8px"
              h="44px"
              fontWeight="700"
              isDisabled={isSubmitting}
              onClick={handleDelete}
              title='Deletar'
            >
              <Trash2 />
            </Button>
            <Button as={Link} to="/admin/produtos" variant="outline" borderRadius="8px" h="44px" title='Voltar'>
              <Undo2 />
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
