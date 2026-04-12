/* eslint-disable @typescript-eslint/no-unused-vars */
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function AtLeastOneExists(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'atLeastOneExists',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
          return !!value || !!relatedValue;
        },
        defaultMessage(_args: ValidationArguments) {
          return `You must provide password or social account.`;
        },
      },
    });
  };
}
