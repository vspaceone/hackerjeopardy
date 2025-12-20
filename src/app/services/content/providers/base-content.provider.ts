import { Observable } from 'rxjs';
import { ContentProvider } from '../content.types';

export abstract class BaseContentProvider implements ContentProvider {
  abstract readonly name: string;
  abstract readonly priority: number;

  abstract getManifest(): Observable<any>;
  abstract getRound(roundId: string): Observable<any>;
  abstract getCategory(roundId: string, categoryName: string): Observable<any>;
  abstract getImageUrl(roundId: string, categoryName: string, imageName: string): string;

  async isAvailable(): Promise<boolean> {
    try {
      await new Promise((resolve, reject) => {
        this.getManifest().subscribe({
          next: () => resolve(true),
          error: reject
        });
      });
      return true;
    } catch {
      return false;
    }
  }

  protected calculateSize(data: any): number {
    // Rough estimation of object size in bytes
    return JSON.stringify(data).length * 2;
  }
}