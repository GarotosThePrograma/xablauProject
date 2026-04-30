import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Flex, Image, Text } from '@chakra-ui/react';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../../features/products/products';
import { PRODUCT_SECTIONS, useProductSectionsStore } from '../../store/useProductSectionsStore';
import { isCouponExpired, normalizeCouponCode, useCouponsStore } from '../../store/useCouponsStore';
import { useToastStore } from '../../store/useToastStore';

const emptyForm = {
  name: '',
  price: '',
  stock: '',
  img: '',
  section: 'hardware',
};

const emptyCouponForm = {
  code: '',
  durationMinutes: '',
  discountPercent: '',
};

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatCouponEndDate(date) {
  const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${formattedDate} às ${formattedTime}`;
}

function getCouponEndText(durationMinutes, expiresAt) {
  const minutes = Number(durationMinutes);

  if (!minutes || !expiresAt) {
    return 'Sem data de término';
  }

  const endDate = new Date(expiresAt);

  if (minutes > 1440) {
    return `Acaba em ${formatCouponEndDate(endDate)}`;
  }

  return `Expira às ${endDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function getCouponDurationPreview(durationMinutes) {
  const minutes = Number(durationMinutes);

  if (!minutes || minutes <= 1440) {
    return '';
  }

  return `Acabará em ${formatCouponEndDate(new Date(Date.now() + minutes * 60 * 1000))}`;
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

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [nameDrafts, setNameDrafts] = useState({});
  const [imageDrafts, setImageDrafts] = useState({});
  const [priceDrafts, setPriceDrafts] = useState({});
  const [stockDrafts, setStockDrafts] = useState({});
  const [sectionDrafts, setSectionDrafts] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const sectionsByProductId = useProductSectionsStore((state) => state.sectionsByProductId);
  const getProductSection = useProductSectionsStore((state) => state.getProductSection);
  const setProductSection = useProductSectionsStore((state) => state.setProductSection);
  const removeProductSection = useProductSectionsStore((state) => state.removeProductSection);
  const coupons = useCouponsStore((state) => state.coupons);
  const addCoupon = useCouponsStore((state) => state.addCoupon);
  const removeCoupon = useCouponsStore((state) => state.removeCoupon);
  const showToast = useToastStore((state) => state.showToast);
  const couponDurationPreview = getCouponDurationPreview(couponForm.durationMinutes);

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
      setNameDrafts(Object.fromEntries(data.map((product) => [product.id, product.name])));
      setImageDrafts(Object.fromEntries(data.map((product) => [product.id, product.img])));
      setPriceDrafts(Object.fromEntries(data.map((product) => [product.id, product.price])));
      setStockDrafts(Object.fromEntries(data.map((product) => [product.id, product.stock])));
      setSectionDrafts(Object.fromEntries(data.map((product) => [product.id, getProductSection(product)])));
    } catch {
      setMessage('Não foi possível carregar os produtos.');
    } finally {
      setIsLoading(false);
    }
  }, [getProductSection]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts, sectionsByProductId]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const createdProduct = await createProduct(form);
      setProductSection(createdProduct.id, form.section);
      setForm(emptyForm);
      setMessage('Produto adicionado com sucesso.');
      await loadProducts();
    } catch {
      setMessage('Não foi possível adicionar o produto.');
    }
  };

  const handleUpdateProduct = async (productId) => {
    setMessage('');

    const name = (nameDrafts[productId] ?? '').trim();
    const img = (imageDrafts[productId] ?? '').trim();
    const price = Number(priceDrafts[productId]);

    if (!name) {
      setMessage('Informe o nome do produto.');
      return;
    }

    if (!img) {
      setMessage('Informe a URL da imagem.');
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setMessage('Informe um preço válido.');
      return;
    }

    try {
      await updateProduct(productId, {
        name,
        img,
        price,
        stock: stockDrafts[productId],
      });
      setProductSection(productId, sectionDrafts[productId]);
      setMessage('Produto atualizado.');
      showToast({
        title: 'Produto atualizado',
        message: name,
      });
      await loadProducts();
    } catch (error) {
      setMessage(error.message || 'Não foi possível atualizar o produto.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    setMessage('');

    try {
      await deleteProduct(productId);
      removeProductSection(productId);
      setMessage('Produto removido.');
      await loadProducts();
    } catch {
      setMessage('Não foi possível remover o produto.');
    }
  };

  const handleCouponChange = (field, value) => {
    setCouponForm((current) => ({
      ...current,
      [field]: field === 'code' ? normalizeCouponCode(value) : value,
    }));
  };

  const handleCreateCoupon = (event) => {
    event.preventDefault();
    setMessage('');

    try {
      addCoupon(couponForm);
      setCouponForm(emptyCouponForm);
      setMessage('Cupom adicionado com sucesso.');
    } catch (error) {
      setMessage(error.message || 'Não foi possível adicionar o cupom.');
    }
  };

  return (
    <Box p={{ base: '24px 16px', md: '32px 24px' }}>
      <Flex direction="column" gap="24px" maxW="1180px" mx="auto">
        <Box>
          <Text fontSize={{ base: '24px', md: '28px' }} fontWeight="800" color="gray.900">
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
          p={{ base: '16px', md: '20px' }}
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

            <Box flex="1 1 190px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Categoria na Home</Text>
              <AdminSelect value={form.section} onChange={(event) => handleChange('section', event.target.value)}>
                {PRODUCT_SECTIONS.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.label}
                  </option>
                ))}
              </AdminSelect>
            </Box>
          </Flex>

          <Button
            type="submit"
            alignSelf={{ base: 'stretch', md: 'flex-start' }}
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

        <Flex
          direction="column"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="8px"
          p={{ base: '16px', md: '20px' }}
          gap="12px"
        >
          <Box>
            <Text fontSize="18px" fontWeight="700" color="gray.900">
              Cupons
            </Text>
            <Text color="gray.600" fontSize="14px">
              O código fica sempre maiúsculo e sem espaços.
            </Text>
          </Box>

          <Flex as="form" onSubmit={handleCreateCoupon} gap="12px" wrap="wrap" align="end">
            <Box flex="1 1 180px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Nome do cupom</Text>
              <AdminInput value={couponForm.code} onChange={(event) => handleCouponChange('code', event.target.value)} placeholder="XABLAU10" required />
            </Box>

            <Box flex="1 1 180px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Duração (minutos)</Text>
              <AdminInput type="number" min="1" value={couponForm.durationMinutes} onChange={(event) => handleCouponChange('durationMinutes', event.target.value)} placeholder="30" required />
              {couponDurationPreview && (
                <Text fontSize="12px" color="gray.600" fontWeight="600" mt="5px">
                  {couponDurationPreview}
                </Text>
              )}
            </Box>

            <Box flex="1 1 160px">
              <Text fontSize="13px" fontWeight="700" mb="6px">Desconto (%)</Text>
              <AdminInput type="number" min="1" max="100" value={couponForm.discountPercent} onChange={(event) => handleCouponChange('discountPercent', event.target.value)} placeholder="10" required />
            </Box>

            <Button
              type="submit"
              w={{ base: '100%', md: 'auto' }}
              bg="linear-gradient(to top, #004d8e, #3695e3)"
              color="white"
              borderRadius="8px"
              p="5px"
              _hover={{ bg: 'linear-gradient(to top, #00325a, #1f66a0)' }}
            >
              Adicionar cupom
            </Button>
          </Flex>

          <Flex direction="column" gap="8px">
            {coupons.length === 0 ? (
              <Text color="gray.600" fontSize="14px">Nenhum cupom cadastrado.</Text>
            ) : coupons.map((coupon) => (
              <Flex key={coupon.id} justify="space-between" align={{ base: 'stretch', md: 'center' }} direction={{ base: 'column', md: 'row' }} border="1px solid" borderColor="gray.200" borderRadius="8px" p="10px" gap="12px">
                <Box minW="0">
                  <Text
                    fontWeight="800"
                    color="gray.900"
                    overflowWrap="anywhere"
                    wordBreak="break-word"
                    whiteSpace="normal"
                  >
                    {coupon.code}
                  </Text>
                  <Text fontSize="13px" color="gray.600">
                    {coupon.discountPercent}% de desconto por {coupon.durationMinutes || 'sem limite'} min
                  </Text>
                  {coupon.expiresAt && (
                    <Text fontSize="12px" color={isCouponExpired(coupon) ? 'red.500' : 'green.600'} fontWeight="700">
                      {isCouponExpired(coupon)
                        ? 'Expirado'
                        : getCouponEndText(coupon.durationMinutes, coupon.expiresAt)}
                    </Text>
                  )}
                </Box>
                <Button borderRadius="8px" p="5px" colorPalette="red" flexShrink="0" onClick={() => removeCoupon(coupon.id)}>
                  Remover
                </Button>
              </Flex>
            ))}
          </Flex>
        </Flex>

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
                  src={imageDrafts[product.id] || product.img}
                  alt={nameDrafts[product.id] || product.name}
                  boxSize="72px"
                  objectFit="contain"
                  bg="gray.50"
                  borderRadius="8px"
                  alignSelf={{ base: 'center', md: 'auto' }}
                />

                <Box flex="1 1 220px" minW="0">
                  <Text fontWeight="700" color="gray.900" overflowWrap="anywhere" wordBreak="break-word">{nameDrafts[product.id] || product.name}</Text>
                  <Text color="#e27d35" fontWeight="800">{formatCurrency(Number(priceDrafts[product.id] ?? product.price))}</Text>
                </Box>

                <Flex align="end" gap="8px" wrap="wrap" w={{ base: '100%', md: 'auto' }}>
                  <Box w={{ base: '100%', md: '220px' }}>
                    <Text fontSize="12px" fontWeight="700" mb="5px">Nome</Text>
                    <AdminInput
                      value={nameDrafts[product.id] ?? ''}
                      onChange={(event) => setNameDrafts((current) => ({ ...current, [product.id]: event.target.value }))}
                    />
                  </Box>
                  <Box w={{ base: '100%', md: '260px' }}>
                    <Text fontSize="12px" fontWeight="700" mb="5px">URL da imagem</Text>
                    <AdminInput
                      value={imageDrafts[product.id] ?? ''}
                      onChange={(event) => setImageDrafts((current) => ({ ...current, [product.id]: event.target.value }))}
                    />
                  </Box>
                  <Box w={{ base: '100%', md: '120px' }}>
                    <Text fontSize="12px" fontWeight="700" mb="5px">Preço</Text>
                    <AdminInput
                      type="number"
                      step="0.01"
                      min="0"
                      value={priceDrafts[product.id] ?? 0}
                      onChange={(event) => setPriceDrafts((current) => ({ ...current, [product.id]: event.target.value }))}
                    />
                  </Box>
                  <Box w={{ base: '100%', md: '190px' }}>
                    <Text fontSize="12px" fontWeight="700" mb="5px">Categoria</Text>
                    <AdminSelect
                      value={sectionDrafts[product.id] || getProductSection(product)}
                      onChange={(event) => setSectionDrafts((current) => ({ ...current, [product.id]: event.target.value }))}
                    >
                      {PRODUCT_SECTIONS.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.label}
                        </option>
                      ))}
                    </AdminSelect>
                  </Box>
                  <Box w={{ base: '100%', md: '110px' }}>
                    <Text fontSize="12px" fontWeight="700" mb="5px">Estoque</Text>
                    <AdminInput
                      type="number"
                      min="0"
                      value={stockDrafts[product.id] ?? 0}
                      onChange={(event) => setStockDrafts((current) => ({ ...current, [product.id]: event.target.value }))}
                    />
                  </Box>
                  <Button borderRadius="8px" variant="outline" p="5px" w={{ base: '100%', md: 'auto' }} onClick={() => handleUpdateProduct(product.id)}>
                    Atualizar
                  </Button>
                  <Button borderRadius="8px" p="5px" colorPalette="red" w={{ base: '100%', md: 'auto' }} onClick={() => handleDeleteProduct(product.id)}>
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
