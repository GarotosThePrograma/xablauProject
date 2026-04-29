import { useEffect, useState } from 'react';
import { Box, Button, Flex, Image, Text } from '@chakra-ui/react';
import { createProduct, deleteProduct, getProducts, updateProductStock } from '../../features/products/products';

const emptyForm = {
  name: '',
  price: '',
  stock: '',
  img: '',
};

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

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

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [stockDrafts, setStockDrafts] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function loadProducts() {
    try {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
      setStockDrafts(Object.fromEntries(data.map((product) => [product.id, product.stock])));
    } catch {
      setMessage('Não foi possível carregar os produtos.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await createProduct(form);
      setForm(emptyForm);
      setMessage('Produto adicionado com sucesso.');
      await loadProducts();
    } catch {
      setMessage('Não foi possível adicionar o produto.');
    }
  };

  const handleUpdateStock = async (productId) => {
    setMessage('');

    try {
      await updateProductStock(productId, stockDrafts[productId]);
      setMessage('Estoque atualizado.');
      await loadProducts();
    } catch {
      setMessage('Não foi possível atualizar o estoque.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    setMessage('');

    try {
      await deleteProduct(productId);
      setMessage('Produto removido.');
      await loadProducts();
    } catch {
      setMessage('Não foi possível remover o produto.');
    }
  };

  return (
    <Box p="32px 24px">
      <Flex direction="column" gap="24px" maxW="1180px" mx="auto">
        <Box>
          <Text fontSize="28px" fontWeight="800" color="gray.900">
            Produtos
          </Text>
          <Text color="gray.600">
            Adicione produtos, remova itens e ajuste estoque.
          </Text>
        </Box>

        <Flex
          as="form"
          onSubmit={handleCreateProduct}
          direction="column"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="8px"
          p="20px"
          gap="12px"
        >
          <Text fontSize="18px" fontWeight="700" color="gray.900">
            Novo produto
          </Text>

          <Flex gap="12px" wrap="wrap">
            <Box flex="1 1 260px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Nome</Text>
              <AdminInput value={form.name} onChange={(event) => handleChange('name', event.target.value)} required />
            </Box>

            <Box flex="1 1 260px">
              <Text fontSize="13px" fontWeight="700" mb="6px">URL da imagem</Text>
              <AdminInput value={form.img} onChange={(event) => handleChange('img', event.target.value)} required />
            </Box>

            <Box flex="1 1 160px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Preço</Text>
              <AdminInput type="number" step="0.01" min="0" value={form.price} onChange={(event) => handleChange('price', event.target.value)} required />
            </Box>

            <Box flex="1 1 120px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Estoque</Text>
              <AdminInput type="number" min="0" value={form.stock} onChange={(event) => handleChange('stock', event.target.value)} required />
            </Box>
          </Flex>

          <Button
            type="submit"
            alignSelf="flex-start"
            bg="linear-gradient(to top, #004d8e, #3695e3)"
            color="white"
            borderRadius="8px"
            p="5px"
            _hover={{ bg: 'linear-gradient(to top, #00325a, #1f66a0)' }}
          >
            Adicionar produto
          </Button>
        </Flex>

        {message && (
          <Text fontWeight="700" color={message.includes('sucesso') || message.includes('atualizado') || message.includes('removido') ? 'green.600' : 'red.500'}>
            {message}
          </Text>
        )}

        <Flex id="admin-products-list" direction="column" gap="12px" scrollMarginTop="90px">
          <Text fontSize="18px" fontWeight="700" color="gray.900">
            Produtos cadastrados
          </Text>

          {isLoading ? (
            <Text color="gray.600">Carregando produtos...</Text>
          ) : (
            products.map((product) => (
              <Flex
                key={product.id}
                align="center"
                gap="14px"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="8px"
                p="14px"
                wrap="wrap"
              >
                <Image src={product.img} alt={product.name} boxSize="72px" objectFit="contain" bg="gray.50" borderRadius="8px" />

                <Box flex="1 1 280px">
                  <Text fontWeight="700" color="gray.900">{product.name}</Text>
                  <Text color="#e27d35" fontWeight="800">{formatCurrency(product.price)}</Text>
                </Box>

                <Flex align="end" gap="8px">
                  <Box w="110px">
                    <Text fontSize="12px" fontWeight="700" mb="5px">Estoque</Text>
                    <AdminInput
                      type="number"
                      min="0"
                      value={stockDrafts[product.id] ?? 0}
                      onChange={(event) => setStockDrafts((current) => ({ ...current, [product.id]: event.target.value }))}
                    />
                  </Box>
                  <Button borderRadius="8px" variant="outline" p="5px" onClick={() => handleUpdateStock(product.id)}>
                    Atualizar
                  </Button>
                  <Button borderRadius="8px" p="5px" colorPalette="red" onClick={() => handleDeleteProduct(product.id)}>
                    Deletar
                  </Button>
                </Flex>
              </Flex>
            ))
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
