import { Inject, Injectable } from "@nestjs/common";

import { DRIZZLE } from "@/db/drizzle.token";
import type { Database } from "@/db/types";

import { AuthRepository } from "../repositories/auth.repository";

@Injectable()
export class ListLanguages {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject(AuthRepository) private readonly authRepository: AuthRepository,
  ) {}

  async execute(): Promise<{
    languages: {
      id: string;
      name: string;
      isDefault: boolean;
      active: boolean;
    }[];
  }> {
    const languages = await this.authRepository.listLanguages(this.db);
    return { languages };
  }
}
