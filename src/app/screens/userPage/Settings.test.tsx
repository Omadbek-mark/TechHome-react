import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Settings } from './Settings';
import { GlobalContext } from '../../hooks/useGlobals';
import MemberService from '../../services/MemberService';
import { Member } from '../../../lib/types/member';
it('has associated labels, accepts optional empty fields and shows confirmed save success', async () => {
  const member = { _id: 'fixture', memberNick: 'fixture-user', memberPhone: '998900000007' } as Member;
  const changed = vi.fn();
  const save = vi.spyOn(MemberService.prototype, 'updateMember').mockResolvedValue(member);
  render(<GlobalContext.Provider value={{ authMember: member, authState: 'authenticated', setAuthMember: changed, beginAuthChange: vi.fn(), refreshSession: vi.fn(), orderBuilder: new Date(), setOrderBuilder: vi.fn() }}><Settings /></GlobalContext.Provider>);
  expect(screen.getByLabelText('Username')).toHaveValue('fixture-user');
  expect(screen.getByLabelText('Address')).toHaveValue('');
  expect(screen.getByLabelText('Description')).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Profile saved.');
  expect(save).toHaveBeenCalledWith(expect.objectContaining({ memberAddress: '', memberDesc: '' }), undefined);
  expect(changed).toHaveBeenCalledWith(member);
});
