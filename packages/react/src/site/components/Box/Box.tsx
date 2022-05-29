import styled from '@emotion/styled';

export const Box = styled.div(() => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
  width: '100%',
  gap: 32,
  marginTop: 48,
}));
