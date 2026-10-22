import { describe, it, expect } from 'vitest';
import { generateFilterDescription } from '../src/ui/logic/filter-description-gen';
import { makeFilter } from './fixtures';

describe('generateFilterDescription', () => {
  it('returns "Filter: None" when no filters are set', () => {
    expect(generateFilterDescription(makeFilter({}))).toBe('筛选：无');
  });

  it('includes media type', () => {
    const desc = generateFilterDescription(makeFilter({ type: 'video' }));
    expect(desc).toContain('视频');
  });

  it('includes "images" for image type', () => {
    const desc = generateFilterDescription(makeFilter({ type: 'image' }));
    expect(desc).toContain('图片');
  });

  it('includes "live photos" for live type', () => {
    const desc = generateFilterDescription(makeFilter({ type: 'live' }));
    expect(desc).toContain('动态照片');
  });

  it('defaults to "media" when no type is set but other filters are', () => {
    const desc = generateFilterDescription(makeFilter({ owned: 'true' }));
    expect(desc).toContain('媒体内容');
  });

  // ownership
  it('includes "owned"', () => {
    const desc = generateFilterDescription(makeFilter({ owned: 'true' }));
    expect(desc).toContain('本人所有');
  });

  it('includes "not owned"', () => {
    const desc = generateFilterDescription(makeFilter({ owned: 'false' }));
    expect(desc).toContain('非本人所有');
  });

  // space
  it('includes "space consuming"', () => {
    const desc = generateFilterDescription(makeFilter({ space: 'consuming' }));
    expect(desc).toContain('占用存储空间');
  });

  it('includes "non-space consuming"', () => {
    const desc = generateFilterDescription(makeFilter({ space: 'non-consuming' }));
    expect(desc).toContain('不占用存储空间');
  });

  // quality
  it('includes "original quality"', () => {
    const desc = generateFilterDescription(makeFilter({ quality: 'original' }));
    expect(desc).toContain('原始画质');
  });

  it('includes "storage-saver quality"', () => {
    const desc = generateFilterDescription(makeFilter({ quality: 'storage-saver' }));
    expect(desc).toContain('节省存储空间画质');
  });

  // favorites
  it('includes "favorite"', () => {
    const desc = generateFilterDescription(makeFilter({ favorite: 'true' }));
    expect(desc).toContain('已收藏');
  });

  it('includes "non-favorite" for excludeFavorites', () => {
    const desc = generateFilterDescription(makeFilter({ excludeFavorites: 'true' }));
    expect(desc).toContain('未收藏');
  });

  // archive
  it('includes "archived"', () => {
    const desc = generateFilterDescription(makeFilter({ archived: 'true' }));
    expect(desc).toContain('已归档');
  });

  it('includes "non-archived"', () => {
    const desc = generateFilterDescription(makeFilter({ archived: 'false' }));
    expect(desc).toContain('未归档');
  });

  // upload status
  it('includes "fully uploaded"', () => {
    const desc = generateFilterDescription(makeFilter({ uploadStatus: 'full' }));
    expect(desc).toContain('完整上传');
  });

  it('includes "partially uploaded"', () => {
    const desc = generateFilterDescription(makeFilter({ uploadStatus: 'partial' }));
    expect(desc).toContain('部分上传');
  });

  // shared
  it('includes "non-shared"', () => {
    const desc = generateFilterDescription(makeFilter({ excludeShared: 'true' }));
    expect(desc).toContain('未共享');
  });

  // search query
  it('includes search query', () => {
    const desc = generateFilterDescription(makeFilter({ searchQuery: 'cats' }));
    expect(desc).toContain('搜索结果： "cats"');
  });

  // filename regex
  it('includes filename regex include', () => {
    const desc = generateFilterDescription(makeFilter({ fileNameRegex: '\\.jpg$', fileNameMatchType: 'include' }));
    expect(desc).toContain('匹配正则表达式 "\\.jpg$"');
  });

  it('includes filename regex exclude', () => {
    const desc = generateFilterDescription(makeFilter({ fileNameRegex: '\\.raw$', fileNameMatchType: 'exclude' }));
    expect(desc).toContain('不匹配');
  });

  // description regex
  it('includes description regex', () => {
    const desc = generateFilterDescription(makeFilter({ descriptionRegex: 'sunset', descriptionMatchType: 'include' }));
    expect(desc).toContain('描述');
    expect(desc).toContain('sunset');
  });

  // similarity
  it('includes similarity threshold', () => {
    const desc = generateFilterDescription(makeFilter({ similarityThreshold: '0.85' }));
    expect(desc).toContain('相似度');
    expect(desc).toContain('0.85');
  });

  // size range
  it('includes size range', () => {
    const desc = generateFilterDescription(makeFilter({ lowerBoundarySize: '1000', higherBoundarySize: '5000' }));
    expect(desc).toContain('大于 1000 bytes');
    expect(desc).toContain('小于 5000 bytes');
  });

  it('includes only lower size', () => {
    const desc = generateFilterDescription(makeFilter({ lowerBoundarySize: '1000' }));
    expect(desc).toContain('大于 1000 bytes');
    expect(desc).not.toContain('小于');
  });

  // albums
  it('includes target album (single)', () => {
    const desc = generateFilterDescription(makeFilter({ albumsInclude: 'album1' }));
    expect(desc).toContain('目标相册');
  });

  it('includes target albums (multiple)', () => {
    const desc = generateFilterDescription(makeFilter({ albumsInclude: ['a', 'b', 'c'] }));
    expect(desc).toContain('3 个目标相册');
  });

  it('includes exclude albums', () => {
    const desc = generateFilterDescription(makeFilter({ albumsExclude: ['a', 'b'] }));
    expect(desc).toContain('排除内容');
    expect(desc).toContain('2 个所选相册');
  });

  // sort
  it('includes sort by size', () => {
    const desc = generateFilterDescription(makeFilter({ sortBySize: 'true' }));
    expect(desc).toContain('按文件大小排序');
  });

  // date range
  it('includes date range (include, taken)', () => {
    const desc = generateFilterDescription(makeFilter({
      lowerBoundaryDate: '2024-01-01',
      higherBoundaryDate: '2024-12-31',
      intervalType: 'include',
      dateType: 'taken',
    }));
    expect(desc).toContain('拍摄日期');
    expect(desc).toContain('从');
    expect(desc).toContain('到');
  });

  it('includes date range (exclude)', () => {
    const desc = generateFilterDescription(makeFilter({
      lowerBoundaryDate: '2024-01-01',
      higherBoundaryDate: '2024-12-31',
      intervalType: 'exclude',
      dateType: 'uploaded',
    }));
    expect(desc).toContain('上传日期');
    expect(desc).toContain('早于');
    expect(desc).toContain('晚于');
  });

  // validation errors
  it('returns error for invalid date interval', () => {
    const desc = generateFilterDescription(makeFilter({
      lowerBoundaryDate: '2024-12-31',
      higherBoundaryDate: '2024-01-01',
    }));
    expect(desc).toBe('错误：日期范围无效');
  });

  it('returns error for invalid size filter', () => {
    const desc = generateFilterDescription(makeFilter({
      lowerBoundarySize: '5000',
      higherBoundarySize: '1000',
    }));
    expect(desc).toBe('错误：文件大小筛选无效');
  });

  // combined filters
  it('combines multiple filters', () => {
    const desc = generateFilterDescription(makeFilter({
      owned: 'true',
      quality: 'original',
      type: 'image',
      archived: 'false',
    }));
    expect(desc).toContain('本人所有');
    expect(desc).toContain('原始画质');
    expect(desc).toContain('图片');
    expect(desc).toContain('未归档');
    expect(desc).toMatch(/^筛选：全部 /);
  });
});
