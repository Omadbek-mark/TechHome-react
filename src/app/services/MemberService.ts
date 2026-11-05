import { api, SESSION_EXPIRED_EVENT } from "../../lib/api/client";
import { LoginInput, Member, MemberInput, MemberUpdateInput } from "../../lib/types/member";

class MemberService {
  public async signup(input: MemberInput): Promise<Member> {
    return (await api.post("/member/signup", input)).data.member;
  }
  public async login(input: LoginInput): Promise<Member> {
    return (await api.post("/member/login", input)).data.member;
  }
  public async logout(): Promise<boolean> {
    try { return (await api.post("/member/logout", {})).data.logout; }
    finally { window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT)); }
  }
  public async getMemberDetail(): Promise<Member> {
    return (await api.get("/member/detail")).data;
  }
  public async updateMember(input: MemberUpdateInput, imageFile?: File): Promise<Member> {
    const formData = new FormData();
    for (const key of ["memberNick", "memberPhone", "memberAddress", "memberDesc"] as const) {
      if (input[key] !== undefined) formData.append(key, input[key]!);
    }
    if (imageFile) formData.append("memberImage", imageFile);
    // Browser chooses the boundary; the client supplies credentials and CSRF.
    return (await api.post("/member/update", formData)).data;
  }
}
export default MemberService;
