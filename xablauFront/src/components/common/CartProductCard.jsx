import { Flex, Image, Heading, Text, Span, IconButton } from "@chakra-ui/react";
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { useCartStore } from "../../store/useCartStore";


export function CartProductCard({ product }) {
    const addtoCart = useCartStore((state) => state.addToCart);
    const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

    return (
        <Flex
            w='900px'
            p='20px'
            bg='white'
            border='1px solid'
            borderColor='gray.200'
            borderRadius='14px'
            overflow='hidden'
            transition='all 0.25s'
            m='15px'

            _hover={{ boxShadow: '0 8px 28px rgba(0,0,0,0.09)', transform: 'translateY(-4px)', border: '1px solid #e27d35' }}  
            >
            <Flex align='center' justify='space-between' w='100%'>
                <Image
                        src={ product.img } 
                        boxSize='150px'
                        objectFit='cover'
                    />
                <Flex direction='column'>
                    <Heading fontSize='16px'>{ product.name }</Heading>
                    <Text fontSize='13px'>Com desconto no PIX: <Span fontWeight='bold'>R$ { product.price }</Span></Text>
                    <Text fontSize='13px'>Parcelado no cartão: <Span fontWeight='bold' color='green'>3x sem juros R$ { (parseFloat( product.price )) }</Span></Text>
                </Flex>

                <Flex
               
                align='center'
                justify='space-evenly'
                borderRadius='7px'
                >

                    <Flex
                        border='1px solid'
                        borderColor='gray.200'
                        p='5px 0px'
                        borderRadius='5px'
                        align='center'
                    >
                        <IconButton
                            variant="unstyled"
                            color="#e27d35"
                            aria-label="Remover"
                            display="flex"
                            minW="auto"
                            h="auto"
                            m='4px'
                            _hover={{ transform: 'translateY(-2px)', color: '#9b5624' }}
                            onClick={() => decreaseQuantity(product.id)}
                        >
                            <FaTrash />
                        </IconButton>
                        <Text>{ product.quantity }</Text>
                        <IconButton
                            variant="unstyled"
                            color="#e27d35"
                            aria-label="Adicionar"
                            display="flex"
                            minW="auto"
                            h="auto"
                            m='4px'
                            isDisabled={ product.quantity >= product.stock }
                            _hover={{ transform: 'translateY(-2px)', color: '#9b5624' }}
                            onClick={() => addtoCart(product)}
                        >
                            <FaPlus />
                        </IconButton>
                    </Flex>
                </Flex>

                <Flex direction='column' align='center' justify='center'>
                    <Text fontSize='14px'>Preço no PIX:</Text>
                    <Text fontSize='18px' fontWeight='bold' color='#e27d35'>R$ { product.price }</Text>
                </Flex>
            </Flex>
        </Flex>
    )
}