import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import qs from 'qs';
import { LanguageToolResponse } from './language-tool.types';

@Injectable()
export class LanguageToolService {
  languageUrl: string = 'https://api.languagetoolplus.com/v2/check';
  constructor(private readonly httpService: HttpService) {}
  async check(text: string) {
    const payload = {
      text: text,
      language: 'pl-PL',
      enabledOnly: 'false',
    };

    try {
      const { data } = await lastValueFrom(
        this.httpService.post<LanguageToolResponse>(this.languageUrl, qs.stringify(payload), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );
      return data.matches[0].replacements.reduce<string[]>((acc, { value }) => {
        acc.push(value);
        return acc;
      }, []);
    } catch (error) {
      throw new Error(`Error checking text: ${error.message}`);
    }
  }
}
