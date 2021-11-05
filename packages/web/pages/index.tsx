import { Container, Typography } from '@mui/material';
import { GetServerSideProps, NextPage } from 'next';

interface Props {
  name: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  return {
    props: {
      name: 'Michal B.',
    },
  };
};

export const Index: NextPage<Props> = ({ name }) => {
  return (
    <Container>
      <Typography variant="h3">Hello there, {name}</Typography>
    </Container>
  );
};

export default Index;
