import '../../index.css'

import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLoadingBar } from '../../components/common/PageLoadingBar';
import { ProductCard } from '../../components/common/ProductCard';
import { getProducts } from '../../services/productsApi';
import { isCouponExpired, useCouponsStore } from '../../store/useCouponsStore';
import { PRODUCT_SECTIONS, useProductSectionsStore } from '../../store/useProductSectionsStore';

function ProductCardSkeleton() {
  return (
    <Flex
      direction="column"
      justifyContent="space-between"
      w={{ base: '100%', md: '210px' }}
      maxW={{ base: '300px', md: '210px' }}
      flexShrink="0"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="8px"
      overflow="hidden"
      animation="pulse 1.4s ease-in-out infinite"
    >
      <Flex bg="gray.50" h="150px" align="center" justify="center" p="14px">
        <Box w="118px" h="118px" bg="gray.200" borderRadius="8px" />
      </Flex>

        <Box p="12px 14px 14px">
        <Box h="14px" bg="gray.200" borderRadius="6px" mb="8px" />
        <Box h="14px" bg="gray.200" borderRadius="6px" w="80%" mb="16px" />
        <Box h="22px" bg="gray.200" borderRadius="6px" w="60%" mb="12px" />
        <Box h="14px" bg="gray.200" borderRadius="6px" w="48%" mb="12px" />
        <Box h="34px" bg="gray.200" borderRadius="8px" />
      </Box>
    </Flex>
  );
}

function ProductSectionCarousel({ section }) {
  const trackRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const updateOverflow = () => {
      if (!trackRef.current) {
        return;
      }

      setHasOverflow(trackRef.current.scrollWidth > trackRef.current.clientWidth + 2);
    };

    updateOverflow();
    const timeoutId = setTimeout(updateOverflow, 100);
    window.addEventListener('resize', updateOverflow);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateOverflow);
    };
  }, [section.products.length]);

  const scrollProducts = (direction) => {
    if (!trackRef.current) {
      return;
    }

    const firstCard = trackRef.current.firstElementChild;
    const cardStep = firstCard ? firstCard.getBoundingClientRect().width + 14 : 224;
    const visibleWidth = trackRef.current.clientWidth;
    const scrollAmount = Math.max(cardStep, Math.floor(visibleWidth / cardStep) * cardStep);
    const maxScroll = trackRef.current.scrollWidth - visibleWidth;
    const currentScroll = trackRef.current.scrollLeft;

    if (direction === 'next') {
      trackRef.current.scrollTo({
        left: currentScroll + scrollAmount >= maxScroll - 4 ? 0 : currentScroll + scrollAmount,
        behavior: 'smooth',
      });

      return;
    }

    trackRef.current.scrollTo({
      left: currentScroll <= 4 ? maxScroll : currentScroll - scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <Box mb="36px">
      <Flex align="center" justify="space-between" gap="12px" mb="20px">
        <Text fontSize={{ base: '20px', md: '22px' }} fontWeight='700' color='gray.900'>
          {section.label}
        </Text>

        {hasOverflow && (
          <Flex gap="8px" flexShrink="0">
            <Button
              aria-label={`Produtos anteriores de ${section.label}`}
              minW="36px"
              h="36px"
              borderRadius="full"
              bg="white"
              color="#004d8e"
              border="1px solid"
              borderColor="gray.200"
              fontSize="20px"
              fontWeight="900"
              onClick={() => scrollProducts('previous')}
              _hover={{ bg: '#e27d35', color: 'white' }}
            >
              {'<'}
            </Button>

            <Button
              aria-label={`Próximos produtos de ${section.label}`}
              minW="36px"
              h="36px"
              borderRadius="full"
              bg="white"
              color="#004d8e"
              border="1px solid"
              borderColor="gray.200"
              fontSize="20px"
              fontWeight="900"
              onClick={() => scrollProducts('next')}
              _hover={{ bg: '#e27d35', color: 'white' }}
            >
              {'>'}
            </Button>
          </Flex>
        )}
      </Flex>

      <Flex
        ref={trackRef}
        gap="14px"
        overflowX="hidden"
        scrollBehavior="smooth"
        w="100%"
        maxW="100%"
        minW="0"
        justify={{ base: hasOverflow ? 'flex-start' : 'center', md: 'flex-start' }}
      >
        {section.products.map((product) => (
          <Flex
            key={product.id}
            flex={{ base: '0 0 100%', md: '0 0 auto' }}
            minW="0"
            maxW={{ base: '100%', md: 'none' }}
            justify="center"
          >
            <ProductCard product={product} />
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}

function OffersCarousel({ products }) {
  const navigate = useNavigate();
  const coupons = useCouponsStore((state) => state.coupons);
  const activeCoupons = coupons.filter((coupon) => !isCouponExpired(coupon));
  const offerProducts = products.filter((product) => product.stock > 0).slice(0, 4);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    ...activeCoupons.map((coupon) => ({
      id: `coupon-${coupon.id}`,
      type: 'coupon',
      title: `Cupom ${coupon.code}`,
      subtitle: `${coupon.discountPercent}% de desconto`,
      action: 'Use no carrinho',
    })),
    ...offerProducts.map((product) => ({
      id: `product-${product.id}`,
      productId: product.id,
      type: 'product',
      title: product.name,
      subtitle: product.price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      action: 'Oferta em destaque',
      image: product.img,
    })),
  ];

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 3600);

    return () => clearInterval(intervalId);
  }, [slides.length, currentSlide]);

  if (slides.length === 0) {
    return null;
  }

  const slide = slides[currentSlide];
  const isProductSlide = slide.type === 'product';
  const goToPreviousSlide = () => {
    setCurrentSlide((current) => (current === 0 ? slides.length - 1 : current - 1));
  };
  const goToNextSlide = () => {
    setCurrentSlide((current) => (current + 1) % slides.length);
  };
  const openProductDetails = () => {
    if (isProductSlide) {
      navigate(`/product/${slide.productId}`);
    }
  };
  const handleSlideKeyDown = (event) => {
    if (!isProductSlide) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProductDetails();
    }
  };

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="8px"
      overflow="hidden"
      mb="34px"
      position="relative"
    >
      <Flex
        key={slide.id}
        role={isProductSlide ? 'button' : undefined}
        tabIndex={isProductSlide ? 0 : undefined}
        h={{ base: '240px', md: '280px' }}
        align="center"
        justify="space-between"
        gap="20px"
        p={{ base: '22px', md: '32px' }}
        bg="linear-gradient(135deg, #004d8e 0%, #3695e3 58%, #e27d35 100%)"
        color="white"
        animation="carousel-fade 0.42s ease"
        cursor={isProductSlide ? 'pointer' : 'default'}
        overflow="hidden"
        onClick={openProductDetails}
        onKeyDown={handleSlideKeyDown}
      >
        <Box maxW="620px" minW="0" pr={{ base: '42px', md: '0' }}>
          <Text fontSize="13px" fontWeight="800" textTransform="uppercase" letterSpacing="0">
            {slide.action}
          </Text>
          <Text
            fontSize={{ base: '24px', md: '42px' }}
            fontWeight="900"
            lineHeight="1.1"
            mt="8px"
            overflowWrap="anywhere"
            wordBreak="break-word"
            whiteSpace="normal"
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
            }}
          >
            {slide.title}
          </Text>
          <Text
            fontSize={{ base: '16px', md: '20px' }}
            fontWeight="700"
            mt="12px"
            overflowWrap="anywhere"
            wordBreak="break-word"
            whiteSpace="normal"
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
            }}
          >
            {slide.subtitle}
          </Text>
        </Box>

        {slide.type === 'product' && (
          <Flex
            display={{ base: 'none', md: 'flex' }}
            bg="white"
            borderRadius="8px"
            h="190px"
            w="260px"
            align="center"
            justify="center"
            p="18px"
          >
            <Box as="img" src={slide.image} alt={slide.title} style={{ maxHeight: '160px', objectFit: 'contain' }} />
          </Flex>
        )}
      </Flex>

      {slides.length > 1 && (
        <>
          <Button
            position="absolute"
            left="14px"
            top="50%"
            transform="translateY(-50%)"
            minW="40px"
            h="40px"
            borderRadius="full"
            bg="#ffffff7d"
            color="#004d8e"
            fontSize="22px"
            fontWeight="900"
            boxShadow="0 8px 20px rgba(0,0,0,0.18)"
            onClick={(event) => {
              event.stopPropagation();
              goToPreviousSlide();
            }}
            _hover={{ bg: '#e27d3590' }}
          >
            {'<'}
          </Button>

          <Button
            position="absolute"
            right="14px"
            top="50%"
            transform="translateY(-50%)"
            minW="40px"
            h="40px"
            borderRadius="full"
            bg="#ffffff7d"
            color="#004d8e"
            fontSize="22px"
            fontWeight="900"
            boxShadow="0 8px 20px rgba(0,0,0,0.18)"
            onClick={(event) => {
              event.stopPropagation();
              goToNextSlide();
            }}
            _hover={{ bg: '#e27d3590' }}
          >
            {'>'}
          </Button>

          <Flex justify="center" align="center" gap="8px" h="48px">
            <Flex gap="8px">
              {slides.map((item, index) => (
                <Box
                  key={item.id}
                  as="button"
                  type="button"
                  aria-label={`Ir para destaque ${index + 1}`}
                  w={index === currentSlide ? '24px' : '8px'}
                  h="8px"
                  borderRadius="full"
                  bg={index === currentSlide ? '#e27d35' : 'gray.300'}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    setCurrentSlide(index);
                  }}
                />
              ))}
            </Flex>
          </Flex>
        </>
      )}
    </Box>
  );
}

export function Home() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const getProductSection = useProductSectionsStore((state) => state.getProductSection)

  useEffect(() => {
    async function loadProducts () {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  const sortedProducts = products.toSorted((a, b) => {
    if (a.stock > 0 && b.stock <= 0) return -1;
    if (a.stock <= 0 && b.stock > 0) return 1;
    return a.id - b.id;
  });

  const productsBySection = PRODUCT_SECTIONS.map((section) => ({
    ...section,
    products: sortedProducts.filter((product) => getProductSection(product) === section.id),
  }));

  return (
    <Box p={{ base: '28px 16px', md: '40px 24px' }}>
      {isLoading ? (
        <>
          <PageLoadingBar />
          <Text fontSize={{ base: '20px', md: '22px' }} fontWeight='700' color='gray.900' mb='28px'>
            Carregando produtos
          </Text>
          <Flex gap='14px' wrap='wrap' justify="center">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </Flex>
        </>
      ) : (
        <>
          <OffersCarousel products={sortedProducts} />
          {productsBySection
            .filter((section) => section.products.length > 0)
            .map((section) => (
              <ProductSectionCarousel key={section.id} section={section} />
            ))}
        </>
      )}
    </Box>
  );
}
