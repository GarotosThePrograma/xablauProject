import { useState } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import {
  getCouponDurationPreview,
  getCouponEndText,
  isCouponExpired,
  normalizeCouponCode,
  useCouponsStore,
} from '../../store/useCouponsStore';

const emptyCouponForm = {
  code: '',
  durationMinutes: '',
  discountPercent: '',
};

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

export function AdminCoupons() {
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [message, setMessage] = useState('');
  const coupons = useCouponsStore((state) => state.coupons);
  const addCoupon = useCouponsStore((state) => state.addCoupon);
  const removeCoupon = useCouponsStore((state) => state.removeCoupon);
  const couponDurationPreview = getCouponDurationPreview(couponForm.durationMinutes);

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
            Cupons
          </Text>
          <Text color="gray.600">
            Cadastre e remova cupons usados na finalização das compras.
          </Text>
        </Box>

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
              Novo cupom
            </Text>
            <Text color="gray.600" fontSize="14px">
              O código fica sempre maiúsculo e sem espaços.
            </Text>
          </Box>

          <Flex as="form" onSubmit={handleCreateCoupon} gap="12px" wrap="wrap" align="end">
            <Box flex="1 1 180px">
              <Text fontSize="13px" fontWeight="700" mb="6px">
                Nome do cupom
              </Text>
              <AdminInput
                value={couponForm.code}
                onChange={(event) => handleCouponChange('code', event.target.value)}
                placeholder="XABLAU10"
                required
              />
            </Box>

            <Box flex="1 1 180px">
              <Text fontSize="13px" fontWeight="700" mb="6px">
                Duração (minutos)
              </Text>
              <AdminInput
                type="number"
                min="1"
                value={couponForm.durationMinutes}
                onChange={(event) => handleCouponChange('durationMinutes', event.target.value)}
                placeholder="30"
                required
              />
              {couponDurationPreview && (
                <Text fontSize="12px" color="gray.600" fontWeight="600" mt="5px">
                  {couponDurationPreview}
                </Text>
              )}
            </Box>

            <Box flex="1 1 160px">
              <Text fontSize="13px" fontWeight="700" mb="6px">
                Desconto (%)
              </Text>
              <AdminInput
                type="number"
                min="1"
                max="100"
                value={couponForm.discountPercent}
                onChange={(event) => handleCouponChange('discountPercent', event.target.value)}
                placeholder="10"
                required
              />
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

          {message && (
            <Text fontWeight="700" color={message.includes('sucesso') ? 'green.600' : 'red.500'}>
              {message}
            </Text>
          )}
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
          <Text fontSize="18px" fontWeight="700" color="gray.900">
            Cupons cadastrados
          </Text>

          <Flex direction="column" gap="8px">
            {coupons.length === 0 ? (
              <Text color="gray.600" fontSize="14px">
                Nenhum cupom cadastrado.
              </Text>
            ) : coupons.map((coupon) => (
              <Flex
                key={coupon.id}
                justify="space-between"
                align={{ base: 'stretch', md: 'center' }}
                direction={{ base: 'column', md: 'row' }}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="8px"
                p="10px"
                gap="12px"
              >
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

                <Button
                  borderRadius="8px"
                  p="5px"
                  colorPalette="red"
                  flexShrink="0"
                  onClick={() => removeCoupon(coupon.id)}
                >
                  Remover
                </Button>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
