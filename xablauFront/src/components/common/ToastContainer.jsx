import { useEffect } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useToastStore } from '../../store/useToastStore';

function ToastItem({ toast }) {
  const removeToast = useToastStore((state) => state.removeToast);
  const isError = toast.type === 'error';
  const borderColor = isError ? 'red.200' : 'green.200';
  const progressColor = isError ? 'red.500' : 'green.500';

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration);

    return () => clearTimeout(timeoutId);
  }, [removeToast, toast.duration, toast.id]);

  return (
    <Box
      position="relative"
      bg="white"
      border="1px solid"
      borderColor={borderColor}
      borderRadius="8px"
      boxShadow="0 14px 34px rgba(15, 23, 42, 0.22)"
      overflow="hidden"
      w={{ base: 'min(280px, calc(100vw - 24px))', md: '340px' }}
      minW="0"
      animation="toast-enter 0.22s ease"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        h="4px"
        bg={progressColor}
        w="100%"
        transformOrigin="left"
        style={{
          animation: `toast-progress ${toast.duration}ms linear forwards`,
        }}
      />

      <Box p={{ base: '12px', md: '14px 16px' }} pt={{ base: '14px', md: '16px' }}>
        <Text
          fontSize={{ base: '13px', md: '14px' }}
          fontWeight="800"
          color="gray.900"
          lineHeight="1.2"
        >
          {toast.title}
        </Text>
        {toast.message && (
          <Text
            fontSize={{ base: '12px', md: '13px' }}
            color="gray.600"
            mt="4px"
            lineHeight="1.35"
            overflowWrap="anywhere"
            wordBreak="break-word"
          >
            {toast.message}
          </Text>
        )}
      </Box>
    </Box>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <Flex
      position="fixed"
      right={{ base: '12px', md: '22px' }}
      bottom={{ base: '12px', md: '22px' }}
      zIndex="10000"
      direction="column"
      gap="10px"
      align="flex-end"
      pointerEvents="none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </Flex>
  );
}
