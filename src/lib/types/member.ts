import { MemberStatus, MemberType } from "../enums/member.enum";

export interface Member {
  _id: string;
  memberType: MemberType;
  memberStatus: MemberStatus;
  memberNick: string;
  memberPhone: string;
  memberImage?: string;
  memberPoints?: number;
  memberAddress?: string;
  memberDesc?: string;
}

export interface MemberInput {
  memberNick: string;
  memberPhone: string;
  memberPassword: string;
}

export interface LoginInput {
  memberNick: string;
  memberPassword: string;
}

export interface MemberUpdateInput {
  memberNick?: string;
  memberPhone?: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
}
