import logoImg from '../../assets/logo.png';
import { Box } from '@chakra-ui/react';

export function Xablau () {
    return (
        <Box
            as="img"
            src={logoImg}
            alt="Logo Xablau"
            h={{ base: '76px', md: '124px' }}
            w={{ base: '132px', md: '220px' }}
            objectFit="contain"
            p="0"
        />
    )
}
