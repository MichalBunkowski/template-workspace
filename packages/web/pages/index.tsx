import { GetServerSideProps, NextPage } from 'next';

import { Container, Typography } from '@mui/material';

interface Props {
  name: string;
  date: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  return {
    props: {
      name: 'Michal B.',
      date: new Date().toTimeString(),
    },
  };
};

export const Index: NextPage<Props> = ({ name, date }) => {
  return (
    <Container>
      <Typography variant="h3">Hello {name}!</Typography>
      <Typography variant="h5">Time is {date}</Typography>
    </Container>
  );
};

export default Index;
