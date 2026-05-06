import { Box, Button, Flex, IconButton, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Layers3, Trash2 } from 'lucide-react';
import { useAdminHomeSectionsStore } from '../../store/useAdminHomeSectionsStore';
import { useProductSectionsStore } from '../../store/useProductSectionsStore';
import { useEffect, useRef, useState } from 'react';
import { getProducts } from '../../services/productsApi';
import { useToastStore } from '../../store/useToastStore';


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

export function AdminHomeSections() {
  const showToast = useToastStore((state) => state.showToast);
  const sections = useProductSectionsStore((state) => state.sections);
  const moveSection = useProductSectionsStore((state) => state.moveSection);
  const form = useAdminHomeSectionsStore((state) => state.form);
  const isSubmitting = useAdminHomeSectionsStore((state) => state.isSubmitting);
  const setField = useAdminHomeSectionsStore((state) => state.setField);
  const submitSection = useAdminHomeSectionsStore((state) => state.submitSection);
  const deleteSection = useProductSectionsStore((state) => state.deleteSection);

  const [products, setProducts] = useState([]);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [activeSectionId, setActiveSectionId] = useState(null);
  const reorderFeedbackTimeoutRef = useRef(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch {
        showToast({
          type: 'error',
          title: 'Não foi possivel carregar os produtos para validar as seções.',
          message: 'Tente novamente mais tarde'
        });
        setDeleteMessage('Não foi possivel carregar os produtos para validar as seções.');
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    if (!deleteMessage) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setDeleteMessage('');
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [deleteMessage]);

  useEffect(() => {
    return () => {
      if (reorderFeedbackTimeoutRef.current) {
        clearTimeout(reorderFeedbackTimeoutRef.current);
      }
    };
  }, []);

  const handleMoveSection = (sectionId, direction) => {
    const moved = moveSection(sectionId, direction);

    if (!moved) {
      return;
    }

    setActiveSectionId(sectionId);

    if (reorderFeedbackTimeoutRef.current) {
      clearTimeout(reorderFeedbackTimeoutRef.current);
    }

    reorderFeedbackTimeoutRef.current = setTimeout(() => {
      setActiveSectionId(null);
    }, 520);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    try {
      submitSection();
    } catch {
      // feedback already handled by store
    }
  };

  return (
    <Box p={{ base: '24px 16px', md: '32px 24px' }}>
      <Flex direction="column" gap="24px" maxW="1180px" mx="auto">
        <Box>
          <Text fontSize={{ base: '24px', md: '28px' }} fontWeight="800" color="gray.900">
            Seções da home
          </Text>
          <Text color="gray.600">
            Adicione novas seções para organizar os carrosséis da home.
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
              Nova seção
            </Text>
            <Text color="gray.600" fontSize="14px">
              O identificador interno é gerado automaticamente a partir do nome.
            </Text>
          </Box>

          <Flex as="form" onSubmit={handleSubmit} gap="12px" wrap="wrap" align="end">
            <Box flex="1 1 260px">
              <Text fontSize="13px" fontWeight="700" mb="6px">
                Nome da seção
              </Text>
              <AdminInput
                value={form.label}
                onChange={(event) => setField('label', event.target.value)}
                placeholder="Ex.: Cadeiras Gamer"
                required
              />
            </Box>

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
              {isSubmitting ? 'Salvando...' : 'Adicionar'}
            </Button>
          </Flex>
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
            Seções cadastradas
          </Text>

          <Flex direction="column" gap="8px">
            {sections.map((section, index) => (
              <Box
                as={motion.div}
                key={section.id}
                layout
                initial={false}
                animate={{
                  scale: activeSectionId === section.id ? 1.015 : 1,
                  y: activeSectionId === section.id ? -3 : 0,
                }}
                transition={{
                  layout: { type: 'spring', stiffness: 280, damping: 26, mass: 0.78 },
                  scale: { duration: 0.22, ease: 'easeOut' },
                  y: { duration: 0.22, ease: 'easeOut' },
                }}
              >
                <Flex
                  justify="space-between"
                  align={{ base: 'stretch', md: 'center' }}
                  direction={{ base: 'column', md: 'row' }}
                  border="1px solid"
                  borderColor={activeSectionId === section.id ? '#fdba74' : 'gray.200'}
                  borderRadius="10px"
                  p="10px"
                  gap="12px"
                  bg={activeSectionId === section.id ? 'orange.50' : 'white'}
                  boxShadow={activeSectionId === section.id ? '0 14px 28px rgba(226, 125, 53, 0.14)' : 'none'}
                  transition="box-shadow 0.24s ease, transform 0.24s ease, border-color 0.24s ease, background-color 0.24s ease"
                  _hover={{
                    boxShadow: '0 8px 22px rgba(0,0,0,0.06)',
                    borderColor: '#fdba74',
                    transform: 'translateY(-1px)',
                  }}
                >
                  <Box minW="0">
                    <Text fontWeight="800" color="gray.900">
                      {section.label}
                    </Text>
                  </Box>

                  <Flex gap="8px" align="center">
                    <Button
                      aria-label={`Mover ${section.label} para cima`}
                      variant="ghost"
                      borderRadius="full"
                      color="#004d8e"
                      isDisabled={index === 0}
                      onClick={() => handleMoveSection(section.id, 'up')}
                      transition="all 0.18s ease"
                      _hover={{ bg: 'orange.50', color: '#e27d35', transform: 'translateY(-1px)' }}
                    >
                      <ArrowUp size={18} />
                    </Button>

                    <Button
                      aria-label={`Mover ${section.label} para baixo`}
                      variant="ghost"
                      borderRadius="full"
                      color="#004d8e"
                      isDisabled={index === sections.length - 1}
                      onClick={() => handleMoveSection(section.id, 'down')}
                      transition="all 0.18s ease"
                      _hover={{ bg: 'orange.50', color: '#e27d35', transform: 'translateY(-1px)' }}
                    >
                      <ArrowDown size={18} />
                    </Button>

                    <Button 
                      title='Deletar seção'
                      bg='red.500'
                      onClick={() => {
                        try {
                          deleteSection(section.id, products);
                          setDeleteMessage('Seção removida com sucesso.')
                          showToast({
                            type: 'success',
                            title: 'Seção removida com sucesso.'
                          })
                        } catch (e) {
                          showToast({
                            type: 'error',
                            title: e.message
                          })
                          setDeleteMessage(e.message);
                        }
                      }} 
                      >
                      <Trash2 />
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
