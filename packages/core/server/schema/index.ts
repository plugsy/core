/* eslint-disable */
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '../context';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  ColorTone: any;
  DateTime: Date;
  HexColor: any;
  JSONObject: any;
  Void: void;
};

export type ColorShades = {
  __typename?: 'ColorShades';
  _100: Scalars['HexColor'];
  _200: Scalars['HexColor'];
  _300: Scalars['HexColor'];
  _400: Scalars['HexColor'];
  _500: Scalars['HexColor'];
  color: Scalars['HexColor'];
  _600: Scalars['HexColor'];
  _700: Scalars['HexColor'];
  _800: Scalars['HexColor'];
  _900: Scalars['HexColor'];
};


export type Component = {
  __typename?: 'Component';
  name: Scalars['String'];
  props: Maybe<Scalars['JSONObject']>;
};




export type Mutation = {
  __typename?: 'Mutation';
  reload: Maybe<Scalars['Void']>;
};

export type Palette = {
  __typename?: 'Palette';
  background: ColorShades;
  foreground: ColorShades;
  primary: ColorShades;
  secondary: ColorShades;
  success: ColorShades;
  warning: ColorShades;
  error: ColorShades;
  neutral: ColorShades;
};

export type Query = {
  __typename?: 'Query';
  version: Scalars['String'];
  loadedPlugins: Array<Scalars['String']>;
  components: Array<Component>;
  theme: Theme;
  serverTime: Scalars['DateTime'];
};

export type Subscription = {
  __typename?: 'Subscription';
  loadedPlugins: Array<Scalars['String']>;
  serverTime: Scalars['DateTime'];
  components: Array<Component>;
  theme: Theme;
};

export type Theme = {
  __typename?: 'Theme';
  palette: Palette;
  plugins: Scalars['JSONObject'];
};


export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  ColorShades: ResolverTypeWrapper<DeepPartial<ColorShades>>;
  ColorTone: ResolverTypeWrapper<DeepPartial<Scalars['ColorTone']>>;
  Component: ResolverTypeWrapper<DeepPartial<Component>>;
  String: ResolverTypeWrapper<DeepPartial<Scalars['String']>>;
  DateTime: ResolverTypeWrapper<DeepPartial<Scalars['DateTime']>>;
  HexColor: ResolverTypeWrapper<DeepPartial<Scalars['HexColor']>>;
  JSONObject: ResolverTypeWrapper<DeepPartial<Scalars['JSONObject']>>;
  Mutation: ResolverTypeWrapper<{}>;
  Palette: ResolverTypeWrapper<DeepPartial<Palette>>;
  Query: ResolverTypeWrapper<{}>;
  Subscription: ResolverTypeWrapper<{}>;
  Theme: ResolverTypeWrapper<DeepPartial<Theme>>;
  Void: ResolverTypeWrapper<DeepPartial<Scalars['Void']>>;
  Boolean: ResolverTypeWrapper<DeepPartial<Scalars['Boolean']>>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  ColorShades: DeepPartial<ColorShades>;
  ColorTone: DeepPartial<Scalars['ColorTone']>;
  Component: DeepPartial<Component>;
  String: DeepPartial<Scalars['String']>;
  DateTime: DeepPartial<Scalars['DateTime']>;
  HexColor: DeepPartial<Scalars['HexColor']>;
  JSONObject: DeepPartial<Scalars['JSONObject']>;
  Mutation: {};
  Palette: DeepPartial<Palette>;
  Query: {};
  Subscription: {};
  Theme: DeepPartial<Theme>;
  Void: DeepPartial<Scalars['Void']>;
  Boolean: DeepPartial<Scalars['Boolean']>;
}>;

export type ColorShadesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ColorShades'] = ResolversParentTypes['ColorShades']> = ResolversObject<{
  _100: Resolver<ResolversTypes['HexColor'], ParentType, ContextType>;
  _200: Resolver<ResolversTypes['HexColor'], ParentType, ContextType>;
  _300: Resolver<ResolversTypes['HexColor'], ParentType, ContextType>;
  _400: Resolver<ResolversTypes['HexColor'], ParentType, ContextType>;
  _500: Resolver<ResolversTypes['HexColor'], ParentType, ContextType>;
  color: Resolver<ResolversTypes['HexColor'], ParentType, ContextType>;
  _600: Resolver<ResolversTypes['HexColor'], ParentType, ContextType>;
  _700: Resolver<ResolversTypes['HexColor'], ParentType, ContextType>;
  _800: Resolver<ResolversTypes['HexColor'], ParentType, ContextType>;
  _900: Resolver<ResolversTypes['HexColor'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface ColorToneScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ColorTone'], any> {
  name: 'ColorTone';
}

export type ComponentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Component'] = ResolversParentTypes['Component']> = ResolversObject<{
  name: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  props: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export interface HexColorScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['HexColor'], any> {
  name: 'HexColor';
}

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  reload: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType>;
}>;

export type PaletteResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Palette'] = ResolversParentTypes['Palette']> = ResolversObject<{
  background: Resolver<ResolversTypes['ColorShades'], ParentType, ContextType>;
  foreground: Resolver<ResolversTypes['ColorShades'], ParentType, ContextType>;
  primary: Resolver<ResolversTypes['ColorShades'], ParentType, ContextType>;
  secondary: Resolver<ResolversTypes['ColorShades'], ParentType, ContextType>;
  success: Resolver<ResolversTypes['ColorShades'], ParentType, ContextType>;
  warning: Resolver<ResolversTypes['ColorShades'], ParentType, ContextType>;
  error: Resolver<ResolversTypes['ColorShades'], ParentType, ContextType>;
  neutral: Resolver<ResolversTypes['ColorShades'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  version: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  loadedPlugins: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  components: Resolver<Array<ResolversTypes['Component']>, ParentType, ContextType>;
  theme: Resolver<ResolversTypes['Theme'], ParentType, ContextType>;
  serverTime: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  loadedPlugins: SubscriptionResolver<Array<ResolversTypes['String']>, "loadedPlugins", ParentType, ContextType>;
  serverTime: SubscriptionResolver<ResolversTypes['DateTime'], "serverTime", ParentType, ContextType>;
  components: SubscriptionResolver<Array<ResolversTypes['Component']>, "components", ParentType, ContextType>;
  theme: SubscriptionResolver<ResolversTypes['Theme'], "theme", ParentType, ContextType>;
}>;

export type ThemeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Theme'] = ResolversParentTypes['Theme']> = ResolversObject<{
  palette: Resolver<ResolversTypes['Palette'], ParentType, ContextType>;
  plugins: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface VoidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Void'], any> {
  name: 'Void';
}

export type Resolvers<ContextType = Context> = ResolversObject<{
  ColorShades: ColorShadesResolvers<ContextType>;
  ColorTone: GraphQLScalarType;
  Component: ComponentResolvers<ContextType>;
  DateTime: GraphQLScalarType;
  HexColor: GraphQLScalarType;
  JSONObject: GraphQLScalarType;
  Mutation: MutationResolvers<ContextType>;
  Palette: PaletteResolvers<ContextType>;
  Query: QueryResolvers<ContextType>;
  Subscription: SubscriptionResolvers<ContextType>;
  Theme: ThemeResolvers<ContextType>;
  Void: GraphQLScalarType;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
