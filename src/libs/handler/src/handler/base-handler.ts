export interface IBaseHandler<TCommand, TResult> {
  execute(command: TCommand): Promise<TResult>;
}
