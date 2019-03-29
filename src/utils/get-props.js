import _ from 'lodash';

export default function getProps(selector, style, { className, ...rest } = {}) {
  const cname = `${selector} ${className}`;

  return {
    ...rest,
    className: cname,
    style: _.get(style, `.${selector}`),
  };
}
