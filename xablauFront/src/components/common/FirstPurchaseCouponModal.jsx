import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { TicketPercent, X } from 'lucide-react';
import { formatCouponEndDate } from '../../store/useCouponsStore';
import { useToastStore } from '../../store/useToastStore';

export function FirstPurchaseCouponModal({ coupon, isOpen, onClose }) {
  const showToast = useToastStore((state) => state.showToast);

  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      showToast({
        title: 'Cupom copiado para área de tranferência',
        message: coupon.code,
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Não foi possível copiar o cupom',
        message: 'Copie manualmente o código exibido.',
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && coupon && (
        <Box
          as={motion.div}
          position="fixed"
          inset="0"
          zIndex="9998"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Box
            position="absolute"
            inset="0"
            bg="rgba(15, 23, 42, 0.34)"
            backdropFilter="blur(6px)"
          />

          <Flex
            position="relative"
            zIndex="1"
            minH="100vh"
            align="center"
            justify="center"
            p={{ base: '18px', md: '24px' }}
          >
            <Box
              as={motion.div}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.97 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="18px"
              boxShadow="0 24px 60px rgba(15, 23, 42, 0.24)"
              maxW="520px"
              w="100%"
              overflow="hidden"
            >
              <Box
                bg="linear-gradient(135deg, #004d8e 0%, #3695e3 58%, #e27d35 100%)"
                color="white"
                p={{ base: '18px', md: '22px 24px' }}
              >
                <Flex justify="space-between" align="flex-start" gap="12px">
                  <Flex gap="12px" align="center" minW="0">
                    <Flex
                      boxSize="42px"
                      borderRadius="full"
                      bg="rgba(255,255,255,0.16)"
                      align="center"
                      justify="center"
                      flexShrink="0"
                    >
                      <TicketPercent size={20} />
                    </Flex>
                    <Box minW="0">
                      <Text fontSize={{ base: '22px', md: '24px' }} fontWeight="900" lineHeight="1.1">
                        Cupom de primeira compra
                      </Text>
                      <Text mt="6px" fontSize="14px" opacity="0.92">
                        Seu desconto exclusivo ja esta liberado.
                      </Text>
                    </Box>
                  </Flex>

                  <Button
                    onClick={onClose}
                    variant="ghost"
                    minW="40px"
                    h="40px"
                    borderRadius="full"
                    color="white"
                    _hover={{ bg: 'rgba(255,255,255,0.14)' }}
                  >
                    <X size={18} />
                  </Button>
                </Flex>
              </Box>

              <Flex direction="column" gap="16px" p={{ base: '18px', md: '24px' }}>
                <Text color="gray.600" lineHeight="1.6">
                  Use o codigo abaixo na finalizacao da compra. Ele vale por 1 semana e funciona uma unica vez por conta.
                </Text>

                <Box
                  border="1px dashed"
                  borderColor="orange.300"
                  bg="orange.50"
                  borderRadius="14px"
                  p="18px"
                  textAlign="center"
                >
                  <Text fontSize="12px" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="0.08em">
                    Codigo do cupom
                  </Text>
                  <Text mt="8px" fontSize={{ base: '28px', md: '34px' }} fontWeight="900" color="#004d8e" overflowWrap="anywhere">
                    {coupon.code}
                  </Text>
                  <Text mt="10px" fontSize="13px" color="gray.600" fontWeight="600">
                    {coupon.discountPercent}% de desconto ate {formatCouponEndDate(new Date(coupon.expiresAt))}
                  </Text>
                </Box>

                <Flex gap="10px" wrap="wrap">
                  <Button
                    onClick={handleCopyCoupon}
                    bg="linear-gradient(to top, #004d8e, #3695e3)"
                    color="white"
                    borderRadius="10px"
                    flex="1 1 190px"
                    _hover={{ bg: 'linear-gradient(to top, #00325a, #1f66a0)' }}
                  >
                    Copiar cupom
                  </Button>

                  <Button
                    onClick={onClose}
                    variant="outline"
                    borderRadius="10px"
                    flex="1 1 160px"
                  >
                    Ver depois
                  </Button>
                </Flex>
              </Flex>
            </Box>
          </Flex>
        </Box>
      )}
    </AnimatePresence>
  );
}
