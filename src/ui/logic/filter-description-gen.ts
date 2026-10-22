import type { Filter } from '../../types';

function parseSize(value?: string): number {
  return parseInt(value ?? '0', 10);
}

function parseNumber(value?: string): number {
  return parseFloat(value ?? '');
}

function formatDate(value?: string): string | null {
  return value ? new Date(value).toLocaleString('zh-CN') : null;
}

function pluralAlbums(keys: string | string[], noun: string): string {
  return Array.isArray(keys)
    ? `位于 ${keys.length} 个${noun}相册中`
    : `位于${noun}相册中`;
}

interface DescriptionRule {
  test: (f: Filter) => boolean;
  describe: (f: Filter) => string | string[];
}

const rules: DescriptionRule[] = [
  { test: (f) => f.owned === 'true',   describe: () => '本人所有' },
  { test: (f) => f.owned === 'false',  describe: () => '非本人所有' },

  { test: (f) => f.space === 'consuming',      describe: () => '占用存储空间' },
  { test: (f) => f.space === 'non-consuming',   describe: () => '不占用存储空间' },

  { test: (f) => f.uploadStatus === 'full',     describe: () => '完整上传' },
  { test: (f) => f.uploadStatus === 'partial',  describe: () => '部分上传' },

  { test: (f) => f.excludeShared === 'true', describe: () => '未共享' },

  { test: (f) => f.favorite === 'true', describe: () => '已收藏' },
  {
    test: (f) => f.excludeFavorites === 'true' || f.favorite === 'false',
    describe: () => '未收藏',
  },

  { test: (f) => f.quality === 'original',       describe: () => '原始画质' },
  { test: (f) => f.quality === 'storage-saver',  describe: () => '节省存储空间画质' },

  { test: (f) => f.hasLocation === 'true',  describe: () => '有位置信息' },
  { test: (f) => f.hasLocation === 'false', describe: () => '无位置信息' },

  {
    test: (f) => Boolean(f.boundSouth && f.boundWest && f.boundNorth && f.boundEast),
    describe: (f) => `位于范围：南纬 ${f.boundSouth}、西经 ${f.boundWest}、北纬 ${f.boundNorth}、东经 ${f.boundEast}`,
  },

  { test: (f) => f.archived === 'true',  describe: () => '已归档' },
  { test: (f) => f.archived === 'false', describe: () => '未归档' },

  {
    test: () => true,
    describe: (f) => {
      const typeMap: Record<string, string> = {
        video: '视频',
        live: '动态照片',
        image: '图片',
      };
      return typeMap[f.type ?? ''] ?? '媒体内容';
    },
  },

  {
    test: (f) => !!f.searchQuery,
    describe: (f) => `搜索结果： "${f.searchQuery}"`,
  },

  {
    test: (f) => !!f.fileNameRegex,
    describe: (f) => {
      const verb = f.fileNameMatchType === 'exclude' ? '不匹配' : '匹配';
      return `文件名${verb}正则表达式 "${f.fileNameRegex}"`;
    },
  },

  {
    test: (f) => !!f.descriptionRegex,
    describe: (f) => {
      const verb = f.descriptionMatchType === 'exclude' ? '不匹配' : '匹配';
      return `描述${verb}正则表达式 "${f.descriptionRegex}"`;
    },
  },

  {
    test: (f) => !!f.similarityThreshold,
    describe: (f) => `相似度高于 "${f.similarityThreshold}"`,
  },

  {
    test: (f) => parseSize(f.minWidth) > 0 || parseSize(f.maxWidth) > 0 || parseSize(f.minHeight) > 0 || parseSize(f.maxHeight) > 0,
    describe: (f) => {
      const parts: string[] = [];
      const minW = parseSize(f.minWidth);
      const maxW = parseSize(f.maxWidth);
      const minH = parseSize(f.minHeight);
      const maxH = parseSize(f.maxHeight);
      if (minW > 0) parts.push(`宽度 ≥ ${minW}px`);
      if (maxW > 0) parts.push(`宽度 ≤ ${maxW}px`);
      if (minH > 0) parts.push(`高度 ≥ ${minH}px`);
      if (maxH > 0) parts.push(`高度 ≤ ${maxH}px`);
      return `分辨率： ${parts.join(', ')}`;
    },
  },

  {
    test: (f) => !isNaN(parseNumber(f.minDuration)) || !isNaN(parseNumber(f.maxDuration)),
    describe: (f) => {
      const minDuration = parseNumber(f.minDuration);
      const maxDuration = parseNumber(f.maxDuration);
      const parts: string[] = [];
      if (!isNaN(minDuration)) parts.push(`时长 ≥ ${minDuration}s`);
      if (!isNaN(maxDuration)) parts.push(`时长 ≤ ${maxDuration}s`);
      return parts.join('、');
    },
  },

  {
    test: (f) => parseSize(f.lowerBoundarySize) > 0 || parseSize(f.higherBoundarySize) > 0,
    describe: (f) => {
      const lo = parseSize(f.lowerBoundarySize);
      const hi = parseSize(f.higherBoundarySize);
      const parts: string[] = [];
      if (lo > 0) parts.push(`大于 ${lo} bytes`);
      if (lo > 0 && hi > 0) parts.push('且');
      if (hi > 0) parts.push(`小于 ${hi} bytes`);
      return parts;
    },
  },

  {
    test: (f) => !!f.albumsInclude,
    describe: (f) => pluralAlbums(f.albumsInclude ?? [], '目标'),
  },

  {
    test: (f) => !!f.albumsExclude,
    describe: (f) => ['排除内容', pluralAlbums(f.albumsExclude ?? [], '所选')],
  },

  {
    test: (f) => Boolean(f.lowerBoundaryDate ?? f.higherBoundaryDate),
    describe: (f) => {
      const lo = formatDate(f.lowerBoundaryDate);
      const hi = formatDate(f.higherBoundaryDate);
      const parts: string[] = [];

      if (f.dateType === 'taken') parts.push('拍摄日期');
      else if (f.dateType === 'uploaded') parts.push('上传日期');

      if (lo && hi) {
        parts.push(
          f.intervalType === 'exclude'
            ? `早于 ${lo} 或晚于 ${hi}`
            : `从 ${lo} 到 ${hi}`
        );
      } else if (lo) {
        parts.push(f.intervalType === 'exclude' ? `早于 ${lo}` : `晚于 ${lo}`);
      } else if (hi) {
        parts.push(f.intervalType === 'exclude' ? `晚于 ${hi}` : `早于 ${hi}`);
      }

      return parts;
    },
  },

  { test: (f) => !!f.sortBySize, describe: () => '按文件大小排序' },
];

function validate(filter: Filter): string | null {
  if (
    filter.lowerBoundaryDate &&
    filter.higherBoundaryDate &&
    filter.lowerBoundaryDate >= filter.higherBoundaryDate
  ) {
    return '错误：日期范围无效';
  }

  const lo = parseSize(filter.lowerBoundarySize);
  const hi = parseSize(filter.higherBoundarySize);
  if (lo > 0 && hi > 0 && lo >= hi) {
    return '错误：文件大小筛选无效';
  }

  const bS = parseFloat(filter.boundSouth ?? '');
  const bN = parseFloat(filter.boundNorth ?? '');
  const hasSomeBounds = [bS, parseFloat(filter.boundWest ?? ''), bN, parseFloat(filter.boundEast ?? '')].some((v) => !isNaN(v));
  const hasAllBounds = [bS, parseFloat(filter.boundWest ?? ''), bN, parseFloat(filter.boundEast ?? '')].every((v) => !isNaN(v));
  if (hasSomeBounds && !hasAllBounds) {
    return '错误：地理范围需要填写全部四个坐标';
  }
  if (hasAllBounds && bS >= bN) {
    return '错误：南纬度必须小于北纬度';
  }

  const minW = parseSize(filter.minWidth);
  const maxW = parseSize(filter.maxWidth);
  if (minW > 0 && maxW > 0 && minW >= maxW) {
    return '错误：宽度范围无效';
  }

  const minH = parseSize(filter.minHeight);
  const maxH = parseSize(filter.maxHeight);
  if (minH > 0 && maxH > 0 && minH >= maxH) {
    return '错误：高度范围无效';
  }

  const minDuration = parseNumber(filter.minDuration);
  const maxDuration = parseNumber(filter.maxDuration);
  if (!isNaN(minDuration) && minDuration < 0) {
    return '错误：最短时长无效';
  }
  if (!isNaN(maxDuration) && maxDuration < 0) {
    return '错误：最长时长无效';
  }
  if (!isNaN(minDuration) && !isNaN(maxDuration) && minDuration >= maxDuration) {
    return '错误：时长范围无效';
  }

  return null;
}

export function generateFilterDescription(filter: Filter): string {
  const error = validate(filter);
  if (error) return error;

  const parts: string[] = ['筛选：全部'];

  for (const rule of rules) {
    if (rule.test(filter)) {
      const fragment = rule.describe(filter);
      if (Array.isArray(fragment)) {
        parts.push(...fragment);
      } else {
        parts.push(fragment);
      }
    }
  }

  const result = parts.join(' ');
  return result === '筛选：全部 媒体内容' ? '筛选：无' : result;
}
