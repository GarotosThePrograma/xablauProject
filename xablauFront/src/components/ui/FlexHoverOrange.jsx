import { Flex } from "@chakra-ui/react";

export function FlexHoverOrange({ children , ...props}) {
    return (
        <Flex 
            direction="row"
            justify='center'
            align='center'
            size={42} 
            strokeWidth={1.5} 
            transition="all 0.3s ease-in-out"
            gap={'8px'}
            cursor="pointer"
            _hover={{ color: '#e27d35', transform: 'scale(1.1)'}} 
            {...props}
            >
            {children}
        </Flex>
    );
}
