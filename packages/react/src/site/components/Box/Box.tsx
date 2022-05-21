import styled from '@emotion/styled';

export const Box = styled.div(() => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
  gap: 32,
  width: '100%',
}));
