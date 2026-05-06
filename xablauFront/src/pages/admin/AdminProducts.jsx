import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, IconButton, Image, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FilterX, Search } from 'lucide-react';
import { LuPencil } from 'react-icons/lu';
import { getProducts } from '../../services/productsApi';
import { PRODUCT_SECTIONS, useProductSectionsStore } from '../../store/useProductSectionsStore';
import { useAdminProductsFiltersStore } from '../../store/useAdminProductsFiltersStore';

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
      p="9px 12px"
      fontSize="14px"
      outline="none"
      w="100%"
      bg="white"
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
      p="9px 12px"
      fontSize="14px"
      outline="none"
      w="100%"
      bg="white"
      {...props}
    />
  );
}

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const getProductSection = useProductSectionsStore((state) => state.getProductSection);
  const search = useAdminProductsFiltersStore((state) => state.search);
  const stock = useAdminProductsFiltersStore((state) => state.stock);
  const section = useAdminProductsFiltersStore((state) => state.section);
  const setSearch = useAdminProductsFiltersStore((state) => state.setSearch);
  const setStock = useAdminProductsFiltersStore((state) => state.setStock);
  const setSection = useAdminProductsFiltersStore((state) => state.setSection);
  const clearFilters = useAdminProductsFiltersStore((state) => state.clearFilters);

  const loadProducts = useCallback(async () => {
    try {
      setMessage('');
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch {
      setMessage('Não foi possível carregar os produtos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const productSection = getProductSection(product);
      const matchesSearch = !normalizedSearch
        || product.name.toLowerCase().includes(normalizedSearch)
        || String(product.id).includes(normalizedSearch);
      const matchesStock = stock === 'all'
        || (stock === 'inStock' && Number(product.stock) > 0)
        || (stock === 'outOfStock' && Number(product.stock) === 0);
      const matchesSection = section === 'all' || productSection === section;

      return matchesSearch && matchesStock && matchesSection;
    });
  }, [getProductSection, products, search, section, stock]);

  const hasActiveFilters = search.trim() || stock !== 'all' || section !== 'all';

  return (
    <Box p={{ base: '24px 16px', md: '32px 24px' }}>
      <Flex direction="column" gap="24px" maxW="1180px" mx="auto">
        <Flex align={{ base: 'stretch', md: 'flex-end' }} justify="space-between" gap="12px" wrap="wrap">
          <Box>
            <Text fontSize={{ base: '24px', md: '28px' }} fontWeight="800" color="gray.900">
              Produtos
            </Text>
            <Text color="gray.600">
              Pesquise, filtre e abra a edição do item que você quiser ajustar.
            </Text>
          </Box>

          <Button
            as={Link}
            to="/admin/produtos/novo"
            bg="linear-gradient(to top, #004d8e, #3695e3)"
            color="white"
            borderRadius="8px"
            p="5px"
            _hover={{ bg: 'linear-gradient(to top, #00325a, #1f66a0)' }}
          >
            Novo produto
          </Button>
        </Flex>

        <Flex
          direction="column"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="8px"
          p={{ base: '16px', md: '20px' }}
          gap="12px"
        >
          <Text fontSize="16px" fontWeight="700" color="gray.900">
            Buscar e filtrar
          </Text>

          <Flex gap="12px" wrap="wrap" align={{ base: 'stretch', md: 'flex-end' }}>
            <Box flex="1 1 320px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Pesquisa</Text>
              <Flex position="relative" align="center">
                <Box position="absolute" left="10px" color="gray.400" pointerEvents="none">
                  <Search size={16} />
                </Box>
                <AdminInput
                  pl="36px"
                  placeholder="Buscar por nome ou ID"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </Flex>
            </Box>

            <Box flex="1 1 180px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Estoque</Text>
              <AdminSelect value={stock} onChange={(event) => setStock(event.target.value)}>
                <option value="all">Todos</option>
                <option value="inStock">Em estoque</option>
                <option value="outOfStock">Esgotados</option>
              </AdminSelect>
            </Box>

            <Box flex="1 1 210px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Tipo</Text>
              <AdminSelect value={section} onChange={(event) => setSection(event.target.value)}>
                <option value="all">Todos</option>
                {PRODUCT_SECTIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </AdminSelect>
            </Box>

            <Button
              type="button"
              variant="outline"
              borderRadius="8px"
              p="5px"
              leftIcon={<FilterX size={16} />}
              isDisabled={!hasActiveFilters}
              onClick={clearFilters}
            >
              Limpar
            </Button>
          </Flex>
        </Flex>

        {message && (
          <Text fontWeight="700" color="red.500">
            {message}
          </Text>
        )}

        <Flex id="admin-products-list" direction="column" gap="12px" scrollMarginTop="90px">
          <Flex align="center" justify="space-between" gap="12px" wrap="wrap">
            <Text fontSize="18px" fontWeight="700" color="gray.900">
              Produtos cadastrados
            </Text>
            {!isLoading && (
              <Text color="gray.500" fontSize="14px">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado' : 'resultados'}
              </Text>
            )}
          </Flex>

          {isLoading ? (
            <Text color="gray.600">Carregando produtos...</Text>
          ) : filteredProducts.length === 0 ? (
            <Text color="gray.600">Nenhum produto encontrado com esse filtro.</Text>
          ) : (
            filteredProducts.map((product) => (
              <Flex
                key={product.id}
                align={{ base: 'stretch', md: 'center' }}
                gap="14px"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="8px"
                p="14px"
                wrap="wrap"
              >
                <Image
                  src={product.img}
                  alt={product.name}
                  boxSize="72px"
                  objectFit="contain"
                  bg="gray.50"
                  borderRadius="8px"
                  alignSelf={{ base: 'center', md: 'auto' }}
                />
                <Box flex="1 1 220px" minW="0">
                  <Text fontWeight="700" color="gray.900" overflowWrap="anywhere" wordBreak="break-word">
                    {product.name}
                  </Text>
                  <Text color="#e27d35" fontWeight="800">
                    {formatCurrency(Number(product.price))}
                  </Text>
                  <Text color="gray.500" fontSize="13px" mt="4px">
                    Estoque: {product.stock}
                  </Text>
                </Box>

                <IconButton
                  as={Link}
                  to={`/admin/produtos/editar/${product.id}`}
                  aria-label={`Editar ${product.name}`}
                  variant="ghost"
                  borderRadius="full"
                  color="#004d8e"
                  title="Editar"
                  _hover={{ bg: 'orange.50', color: '#e27d35', transform: 'translateY(-1px)' }}
                >
                  <LuPencil />
                </IconButton>
              </Flex>
            ))
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
